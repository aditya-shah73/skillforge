import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import WorkedExample from "@/components/WorkedExample";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";

const CHECKPOINTS = [
  { id: "latency", title: "Latency numbers" },
  { id: "qps", title: "QPS and throughput math" },
  { id: "capacity", title: "Capacity sizing" },
];

export default function Page() {
  const mod = getModuleBySlug("back-of-envelope")!;

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
        <h1 className="text-4xl font-bold tracking-tight mb-3">Back-of-envelope estimation</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Latency numbers, QPS math, and capacity sizing — the arithmetic you&apos;ll do out loud in every interview and every design review.
        </p>
        <ModuleProgress moduleSlug="back-of-envelope" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📍</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          The ability to produce defensible numbers in seconds. By the end you can sketch storage, QPS, and bandwidth for any consumer-scale system on a napkin — and explain every assumption.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>The latency table — L1 cache to cross-region — committed to memory with mental anchors</li>
          <li>QPS math: DAU → average QPS → peak QPS, including the read/write skew</li>
          <li>Capacity sizing: storage, bandwidth, connections, memory budgets</li>
          <li>One full worked example: URL shortener at 100M URLs/day</li>
        </ul>
      </section>

      <Callout variant="info" title="Why this is module 1">
        <p className="m-0">Every later module — caching, sharding, replication, the case studies — will assume you can convert &quot;100M users&quot; into &quot;~3k average QPS, ~10k peak.&quot; If that conversion isn&apos;t reflexive, every design discussion stays vibes-based. Get this reflex now and the rest of the course gets dramatically easier.</p>
      </Callout>

      {/* ============================================================== */}
      {/* PART 1 — Latency numbers                                       */}
      {/* ============================================================== */}
      <Checkpoint moduleSlug="back-of-envelope" id="latency" title="Latency numbers" xp={20} celebration="Latency table is loaded. Cache to cross-region, in your head.">
      <section>
        <h2>Part 1: Latency numbers you must know</h2>

        <p>
          In 2009 Jeff Dean (one of the architects of Google&apos;s infrastructure) gave a talk where he listed the latency of every operation a server-side engineer touches, from L1 cache reads to cross-continent network calls. That table — usually called &quot;Jeff Dean&apos;s latency numbers&quot; — became one of the most-cited references in our field. Hardware has gotten faster since, but the relative orders of magnitude are still the same, and they&apos;re what every system-design discussion implicitly assumes.
        </p>
        <p>
          Here&apos;s the version you should commit to memory. Numbers are rounded to the nearest order of magnitude — these are mental anchors, not benchmarks.
        </p>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="text-left py-2 pr-4 font-bold">Operation</th>
                <th className="text-left py-2 pr-4 font-bold">Latency</th>
                <th className="text-left py-2 font-bold">Mental anchor</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">L1 cache reference</td><td className="py-2 pr-4 font-mono">~1 ns</td><td className="py-2">A clock tick on a 1 GHz CPU.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">Branch mispredict</td><td className="py-2 pr-4 font-mono">~3 ns</td><td className="py-2">Cost of guessing the wrong way at an if-statement.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">L2 cache reference</td><td className="py-2 pr-4 font-mono">~4 ns</td><td className="py-2">Still faster than the time it takes to think.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">Mutex lock/unlock</td><td className="py-2 pr-4 font-mono">~25 ns</td><td className="py-2">Uncontended. Contended is much worse.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">Main memory (RAM)</td><td className="py-2 pr-4 font-mono">~100 ns</td><td className="py-2">~100x slower than L1. Cache misses hurt.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">Compress 1KB (Snappy)</td><td className="py-2 pr-4 font-mono">~2 µs</td><td className="py-2">Compression is roughly free at small sizes.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">Send 1KB over 1 Gbps network</td><td className="py-2 pr-4 font-mono">~10 µs</td><td className="py-2">Pure transmission cost — ignores propagation.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">SSD random read</td><td className="py-2 pr-4 font-mono">~100 µs</td><td className="py-2">~1000x slower than RAM. Why we cache.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">Read 1MB sequentially from RAM</td><td className="py-2 pr-4 font-mono">~250 µs</td><td className="py-2">Sequential scans are cheap.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">Round trip in same datacenter</td><td className="py-2 pr-4 font-mono">~500 µs</td><td className="py-2">A network hop within a region.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">Read 1MB sequentially from SSD</td><td className="py-2 pr-4 font-mono">~1 ms</td><td className="py-2">SSDs are fast for streaming, slow for random.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">HDD seek</td><td className="py-2 pr-4 font-mono">~10 ms</td><td className="py-2">Why nobody uses spinning disks for OLTP anymore.</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">Cross-region (US East ↔ US West)</td><td className="py-2 pr-4 font-mono">~70 ms</td><td className="py-2">Speed of light ≈ 4ms per 1000km, doubled for round trip, plus switching.</td></tr>
              <tr><td className="py-2 pr-4 font-mono">Cross-continent (US ↔ EU)</td><td className="py-2 pr-4 font-mono">~150 ms</td><td className="py-2">Half a second for a few round trips. Plan accordingly.</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Why each number is roughly that order of magnitude</h3>

        <p>
          You don&apos;t need to memorize raw digits. You need to understand <em>why</em> each tier sits where it does, so you can re-derive numbers when you forget them.
        </p>

        <ul>
          <li><strong>Caches are nanoseconds because they&apos;re on the CPU die.</strong> The signal doesn&apos;t leave the chip. L1 is closer than L2; L2 is closer than RAM.</li>
          <li><strong>RAM is ~100ns because the signal has to travel inches across the motherboard.</strong> Plus addressing logic. The 100x gap from L1 is &quot;leaving the CPU.&quot;</li>
          <li><strong>SSDs are ~100µs because flash is electrons-in-a-cell, but with controllers, queues, and a system call.</strong> Three orders of magnitude slower than RAM. This is the gap that makes caching worth it.</li>
          <li><strong>Network in datacenter is ~500µs because the signal goes through a NIC, switches, another NIC.</strong> Even at the speed of light, switching dominates within a building.</li>
          <li><strong>Cross-region latency is bounded by physics.</strong> Light in fiber goes ~200,000 km/s — about 5ms per 1000km. New York to Los Angeles is ~4000km, so the round trip floor is ~40ms. Real cables aren&apos;t straight, switches add overhead, so ~70ms is realistic. <strong>You cannot beat this with engineering. You can only avoid it.</strong></li>
        </ul>

        <Callout variant="insight" title="The three jumps that matter">
          <p className="m-0">In 99% of design discussions, what you&apos;re really reasoning about is one of three jumps: <strong>RAM → SSD (~1000x), SSD → network (~5x), within-region → cross-region (~100x).</strong> Every &quot;add a cache&quot; argument is about avoiding the first jump. Every &quot;why is this slow&quot; conversation is about which jump just happened. Memorize those three multipliers.</p>
        </Callout>

        <h3>The interview move</h3>

        <p>
          When an interviewer asks you to design something, the latency numbers come up implicitly. &quot;Can we serve 10ms p99 from disk?&quot; <em>Probably not — random SSD is 100µs, you only have ~100 of those before you blow your budget.</em> &quot;Can the read path go cross-region?&quot; <em>Only if your latency budget is over 150ms — otherwise you need a regional cache or replica.</em>
        </p>
        <p>
          You don&apos;t recite the table. You use it to reason about feasibility in 10 seconds.
        </p>

        <Quiz
          kind="Quick check"
          question="Your service has a 50ms p99 latency budget. The read path makes one DB query (against a Postgres in the same region as your service) and returns. Roughly how much budget do you have left for application work in your service after the DB query?"
          options={[
            { label: "Almost none — the DB call alone is ~50ms.", explanation: "A DB call within a region is dominated by the network round trip (~500µs) plus the query itself. Postgres point queries are typically 1–5ms. You have plenty of budget left." },
            { label: "About 45ms — one DB query is typically a few ms.", correct: true, explanation: "Right. Same-region round trip ~500µs, indexed Postgres point query ~1–5ms — so a clean read uses maybe 2–5ms total. The other ~45ms is yours for serialization, business logic, and (importantly) headroom." },
            { label: "Roughly 25ms — DB calls always cost half your budget.", explanation: "Not generally true. A pathological query can cost half your budget, but a normal indexed read on Postgres is single-digit ms." },
            { label: "Can't tell without knowing the query.", explanation: "Technically true, but in interview terms you assume an indexed point read until told otherwise. That puts the answer firmly in the ~5ms range." },
          ]}
        />

        <Quiz
          kind="Gut check"
          question="Your service in us-east-1 calls a payments API in eu-west-1 for every checkout. The customer-facing latency budget is 100ms. What's the dominant problem with this design?"
          options={[
            { label: "The payments API will rate limit us.", explanation: "Maybe, but that's not the main issue. The dominant issue is structural and shows up before any rate limit." },
            { label: "Cross-continent latency alone is ~150ms — you can't fit one round trip into a 100ms budget, let alone TLS handshake plus the API call itself.", correct: true, explanation: "Right. Speed of light bounds you here. No amount of code optimization fixes a physics constraint. You either move the call out of the critical path (queue it, batch it) or you replicate the dependency closer." },
            { label: "TLS overhead doubles the latency.", explanation: "TLS adds a couple round trips on cold connections, but warm connections amortize that. The dominant cost is geographic distance, not TLS." },
            { label: "JSON serialization across regions is slow.", explanation: "Serialization is microseconds. The 150ms gap is about distance, not encoding." },
          ]}
        />

        <h3>Classify them</h3>
        <p>
          Last drill before we move on. Sort these operations by order of magnitude. The point is to feel the tiers — not to memorize exact numbers.
        </p>

        <ClassifyChallenge
          title="Sort by latency tier"
          prompt="Drop each operation into its rough tier. The tiers are 1000x apart, so the answer is usually obvious once the boundaries click."
          buckets={[
            { id: "ns", label: "<1µs (nanoseconds)", color: "emerald" },
            { id: "us", label: "1µs – 1ms (microseconds)", color: "sky" },
            { id: "ms", label: "1ms – 100ms (milliseconds)", color: "indigo" },
            { id: "slow", label: ">100ms (slow)", color: "rose" },
          ]}
          items={[
            { id: "i1", label: "Reading an int field that's in L1 cache", answer: "ns", explanation: "L1 is ~1ns. Nothing in software is faster than this." },
            { id: "i2", label: "Acquiring an uncontended Java ReentrantLock", answer: "ns", explanation: "Mutex lock/unlock is ~25ns when uncontended. Contended is much worse." },
            { id: "i3", label: "A round trip to a Redis instance in the same datacenter", answer: "us", explanation: "Same-DC round trip is ~500µs. Redis itself adds little — it's almost all network." },
            { id: "i4", label: "An SSD random read", answer: "us", explanation: "~100µs for SSD random read. The reason in-memory caches are worth maintaining." },
            { id: "i5", label: "An indexed Postgres point query against a same-region DB", answer: "ms", explanation: "1–5ms typically. Network ~500µs + query ~1–4ms." },
            { id: "i6", label: "Round trip from us-east to eu-west", answer: "slow", explanation: "~150ms cross-continent. Physics-bounded. The reason multi-region designs replicate locally." },
            { id: "i7", label: "A spinning HDD seek", answer: "ms", explanation: "~10ms. The reason OLTP doesn't run on HDDs anymore." },
            { id: "i8", label: "Reading 1MB sequentially from RAM", answer: "us", explanation: "~250µs. RAM is fast for sequential, even faster than you'd guess." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="The latency table isn't trivia — it's the unit system every design discussion uses."
          points={[
            { takeaway: "Three jumps that matter: RAM → SSD (~1000x), within-region → cross-region (~100x), and cache hit → cache miss (varies by tier).", detail: <>Most design conversations are about one of these three jumps. Caching arguments are about the first; multi-region arguments are about the second; everything else cascades from there.</> },
            { takeaway: "Cross-region latency is bounded by the speed of light. ~70ms US East-West, ~150ms US-EU.", detail: <>You cannot engineer this away. You can only design around it — by replicating closer to users, by moving cross-region calls out of the critical path, or by accepting the latency.</> },
            { takeaway: "Don't memorize digits, memorize order-of-magnitude anchors: ns / µs / ms / 100s of ms.", detail: <>If you can sort any operation into the right tier in two seconds, you can do every back-of-envelope downstream. The exact numbers within a tier rarely matter.</> },
            { takeaway: "Use the table for feasibility checks, not for precise budgeting.", detail: <>&quot;Can we hit 50ms p99 from disk?&quot; is a one-line answer using the table. That kind of fast feasibility check is the actual interview skill.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ============================================================== */}
      {/* PART 2 — QPS / throughput math                                 */}
      {/* ============================================================== */}
      <Checkpoint moduleSlug="back-of-envelope" id="qps" title="QPS and throughput math" xp={20} celebration="DAU to QPS in your sleep. Peak ratios, read/write skew, the works.">
      <section>
        <h2>Part 2: QPS and throughput math</h2>

        <p>
          Most design discussions live and die at this step. Someone says &quot;the system has 100 million users&quot; and you have to convert that to a number of requests per second the system actually has to serve. Get this conversion wrong and every downstream decision — sharding, caching, queueing — is wrong by the same factor.
        </p>

        <h3>The base conversion: DAU → average QPS</h3>

        <p>
          A day has <strong>86,400 seconds</strong>. Memorize that, because the conversion is just division.
        </p>

        <CodeBlock lang="plain">{`average QPS = (DAU × actions per user per day) / 86,400`}</CodeBlock>

        <p>
          Two shortcuts so you don&apos;t have to long-divide on a whiteboard:
        </p>
        <ul>
          <li><strong>1 million DAU, 1 action/day each</strong> → ~12 QPS.</li>
          <li><strong>100 million DAU, 1 action/day each</strong> → ~1,200 QPS.</li>
          <li><strong>1 billion DAU, 1 action/day each</strong> → ~12,000 QPS.</li>
        </ul>
        <p>
          Or as a one-liner: <strong>DAU in millions × actions/day ≈ average QPS in dozens.</strong> A 100M-DAU app where each user takes 10 actions/day is ~12,000 average QPS. That&apos;s the whole conversion.
        </p>

        <h3>Average is not what you provision for. Peak is.</h3>

        <p>
          Real consumer traffic is not flat. Twitter at 3am is quiet; Twitter at 9pm Eastern when something is happening is not. You need to provision for peak, not average.
        </p>
        <p>
          A good rule of thumb for consumer apps: <strong>peak QPS ≈ 2-3× average QPS</strong>. For B2B / business-hours apps it can be higher (5-10x), because traffic concentrates into the workday and goes to ~zero at night.
        </p>
        <p>
          Some events spike harder. Black Friday for e-commerce, halftime for a streaming service, a viral tweet. For those you might design for 10x peak. The rule of thumb is &quot;2-3x for steady consumer load, plan separately for known spikes.&quot;
        </p>

        <Callout variant="warn" title="The hidden multiplier: read/write skew">
          <p className="m-0">In most consumer apps, reads dwarf writes by 10-100x. Twitter: every tweet is read by hundreds of followers. A blog post is written once, read thousands of times. So when an interviewer says &quot;100M users posting 2 tweets/day,&quot; the write QPS is ~2,300 — but the read QPS could easily be 230,000+. Always split the math: write QPS and read QPS are different problems with different solutions.</p>
        </Callout>

        <h3>A worked example: Twitter</h3>

        <WorkedExample
          title="Sketching Twitter's QPS"
          subtitle="Toy numbers — but the shape of the math is exactly what you'd do in an interview."
          steps={[
            {
              title: "Step 1 — Pick the user numbers (and state your assumptions)",
              body: (
                <>
                  <p>Assume 300M DAU. Each user posts ~2 tweets/day on average and reads ~200 tweets/day (scrolling the timeline).</p>
                  <p>State the assumption out loud in an interview: &quot;Most users lurk — they read way more than they post. So writes are tiny, reads are huge.&quot;</p>
                </>
              ),
            },
            {
              title: "Step 2 — Average write QPS",
              body: (
                <>
                  <p>(300M × 2) / 86,400 = 600M / 86,400 ≈ <strong>~7,000 average write QPS</strong>.</p>
                  <p>Round it to ~7k. Don&apos;t pretend you know it more precisely than that.</p>
                </>
              ),
            },
            {
              title: "Step 3 — Peak write QPS",
              body: (
                <>
                  <p>2-3x peak ratio: <strong>~15-20k peak write QPS</strong>.</p>
                  <p>That&apos;s the number that has to fit on your write path. A single beefy Postgres can absorb ~20k writes/sec for simple inserts — so writes alone might not even need sharding. Surprising, right?</p>
                </>
              ),
            },
            {
              title: "Step 4 — Average read QPS",
              body: (
                <>
                  <p>(300M × 200) / 86,400 = 60B / 86,400 ≈ <strong>~700,000 average read QPS</strong>.</p>
                  <p>This is 100x the writes. The whole system&apos;s shape is determined by this number.</p>
                </>
              ),
            },
            {
              title: "Step 5 — Peak read QPS",
              body: (
                <>
                  <p>2-3x: <strong>~1.5–2 million peak read QPS</strong>.</p>
                  <p>No single database serves 2M QPS. This is why the canonical Twitter design has a heavily cached, fanout-on-write timeline — the read path is built to avoid the database entirely most of the time.</p>
                </>
              ),
            },
            {
              title: "The takeaway",
              body: (
                <>
                  <p>The math told you the architecture before you drew a single box. The write path is &quot;normal database problem,&quot; the read path is &quot;giant cache fronting a sharded store.&quot; That entire design choice fell out of two divisions and a peak multiplier.</p>
                  <p><strong>This is what every senior interviewer wants to see in the first 5 minutes.</strong> The math <em>derives</em> the architecture, instead of the architecture being asserted.</p>
                </>
              ),
            },
          ]}
        />

        <h3>Storage growth follows the same pattern</h3>

        <p>
          Same conversion, different unit. Storage growth per year:
        </p>
        <CodeBlock lang="plain">{`storage/year = (DAU × items/day × bytes/item × replication factor) × 365`}</CodeBlock>
        <p>
          Twitter again: 300M DAU × 2 tweets/day × ~280 bytes/tweet × 3x replication × 365 days ≈ <strong>~180 TB/year</strong> of raw tweet text. That&apos;s small. Even at 10x for indexes, metadata, and media references, it&apos;s in the low petabytes — utterly tractable on modern infrastructure. The famously hard part of Twitter isn&apos;t storage; it&apos;s the read fanout.
        </p>
        <p>
          The arithmetic skill is identical: pick a per-day number, multiply by users, multiply by bytes, multiply by replication, multiply by days. <strong>If you can do QPS, you can do storage growth — same math, different units.</strong>
        </p>

        <Quiz
          kind="Drill"
          question="A photo-sharing app has 50M DAU. Each user uploads 1 photo/day on average; each photo is ~500KB after compression; 3x replication across availability zones. What's the rough storage growth per year?"
          options={[
            { label: "~25 TB/year — the photos are small once compressed.", explanation: "You missed the replication factor or undercounted users. Re-do the multiplication: 50M × 500KB × 3 × 365." },
            { label: "~27 PB/year", correct: true, explanation: "Right. 50M × 500KB = 25TB/day raw. ×3 replication = 75TB/day. ×365 days ≈ 27PB/year. Photo apps are storage-heavy because the per-item size is large; this is why object storage (S3, GCS) and erasure coding for cold data become essential at scale." },
            { label: "~100 TB/year", explanation: "Off by a factor of ~250. Probably forgot to multiply by days." },
            { label: "~9 PB/year", explanation: "Close, but you missed the replication factor. The 3x is what bumps it to ~27PB." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="A B2B SaaS app has 200k MAU, with about 30% active on any given day and ~50 actions per active user per day. Roughly what average and peak QPS should you provision for?"
          options={[
            { label: "~35 average, ~70 peak QPS", correct: true, explanation: "DAU = 200k × 30% = 60k. Actions/day = 60k × 50 = 3M. /86,400 ≈ 35 average QPS. B2B traffic concentrates in business hours, so a 5x peak ratio is reasonable: ~175 peak. (2x peak gives ~70.) Either is defensible — the point is the average is small and you cite a multiplier." },
            { label: "~3,500 average, ~7,000 peak QPS", explanation: "Off by 100x. Probably treated MAU as DAU and didn't divide by 86,400." },
            { label: "~3 average, ~9 peak QPS", explanation: "Off by 10x. Probably forgot to multiply by 50 actions/day." },
            { label: "~1,000 average, ~2,000 peak QPS", explanation: "Too high. Recompute: 60k DAU × 50 actions / 86,400." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="DAU → QPS → peak QPS is the conversion that anchors every design discussion."
          points={[
            { takeaway: "1M DAU × 1 action/day ≈ 12 average QPS. Scale linearly from there.", detail: <>This is the single shortcut that beats every &quot;divide by 86400&quot; calculation. Memorize it; everything else is multiplying.</> },
            { takeaway: "Peak ≈ 2-3x average for consumer apps, 5-10x for business-hours apps.", detail: <>Provisioning for average gets you paged at 9pm. Provisioning for peak is what production looks like. Always multiply.</> },
            { takeaway: "Reads dwarf writes by 10-100x in most consumer apps.", detail: <>Always split the math. Write QPS and read QPS have different solutions: writes go to the database, reads go through a cache the database barely sees.</> },
            { takeaway: "Storage uses the same math as QPS — pick a per-day number, multiply forward.", detail: <>Replication factor is the easy thing to forget; it&apos;s usually 3x in modern systems and changes your numbers materially.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ============================================================== */}
      {/* PART 3 — Capacity sizing                                       */}
      {/* ============================================================== */}
      <Checkpoint moduleSlug="back-of-envelope" id="capacity" title="Capacity sizing" xp={25} celebration="You can size a system end-to-end. Storage, bandwidth, connections, the lot.">
      <section>
        <h2>Part 3: Capacity sizing</h2>

        <p>
          QPS is one axis. Real systems blow up on the other axes too — storage, bandwidth, connections, memory. Capacity sizing is just doing the same back-of-envelope arithmetic four more times, one per axis.
        </p>

        <h3>The four axes you&apos;ll always size</h3>

        <ol>
          <li><strong>Storage.</strong> Rows × bytes/row × replication factor, integrated over time.</li>
          <li><strong>Bandwidth.</strong> QPS × payload size, both directions.</li>
          <li><strong>Connections.</strong> Concurrent connected clients, plus the ports/sockets/threads they&apos;ll consume per server.</li>
          <li><strong>Memory.</strong> Working set you want to keep hot in RAM. Usually for caches.</li>
        </ol>

        <h3>The 80/20 heuristics</h3>

        <ul>
          <li><strong>If the working set fits in RAM, your read path is going to be fast.</strong> The whole game of caching is keeping the hot subset in RAM. If the dataset is 10TB but the hot 1% is 100GB, that&apos;s a single beefy machine&apos;s worth of cache.</li>
          <li><strong>One commodity server can handle ~10–50k QPS for simple work, ~1–5k QPS for heavy work.</strong> &quot;Simple&quot; = stateless service returning a small JSON. &quot;Heavy&quot; = a service doing several DB calls and some computation per request. Numbers vary, but this is the rough ceiling per-instance before you scale out.</li>
          <li><strong>One Postgres instance handles ~5–30k writes/sec.</strong> Reads can go much higher with replicas. If your write QPS is in this range, you may not need to shard yet.</li>
          <li><strong>1 Gbps NIC saturates at ~125 MB/s.</strong> If your average response is 100KB and you serve 2k QPS, that&apos;s 200 MB/s — you&apos;ve already saturated the NIC. Bandwidth is invisible until it isn&apos;t.</li>
          <li><strong>Each TCP connection costs a few KB of kernel memory plus a file descriptor.</strong> 100k concurrent WebSocket connections per box is achievable but requires tuning. 1M is heroic.</li>
        </ul>

        <Callout variant="info" title={`Why "rule of thumb" is good enough`}>
          <p className="m-0">All of these numbers are approximate, and any specific deployment will be off by 2-5x in either direction. That&apos;s fine. The point of back-of-envelope sizing isn&apos;t to predict production exactly — it&apos;s to know whether you&apos;re looking at &quot;1 box,&quot; &quot;10 boxes,&quot; &quot;100 boxes,&quot; or &quot;not feasible without a different approach.&quot; Those tiers are different conversations.</p>
        </Callout>

        <h3>Java/Spring side note: where the numbers come from in practice</h3>

        <p>
          Once you start measuring real services, you&apos;ll see these heuristics validate (or surprise you). A vanilla Spring MVC app on Tomcat on a 4-vCPU box typically tops out around 5-15k QPS for simple endpoints and 1-3k for endpoints that touch a DB. Reactive (WebFlux on Netty) shifts the ceiling for I/O-bound workloads, not for CPU-bound ones.
        </p>
        <p>
          Spring&apos;s default connection pool sizes are conservative — HikariCP defaults to 10 connections — and that&apos;s usually fine until you suddenly have hundreds of threads waiting on the pool. The first time you see &quot;HikariPool — connection is not available&quot; in production, it&apos;s a clue your connection-axis math was wrong.
        </p>

        <CodeBlock lang="java" caption="Sizing the Hikari pool, with a back-of-envelope">{`// Rough rule: pool_size ≈ ((cores * 2) + effective_spindle_count)
// On a 4-vCPU box with SSD-backed Postgres, that's ~10 connections per app instance.
// 50 app instances × 10 pool size = 500 connections to Postgres total.
// Postgres default max_connections is 100. Math doesn't work.
//
// Two real fixes:
//   1) Run pgBouncer in front of Postgres (transaction pooling, not session).
//   2) Lower per-instance pool size and rely on transparent pooling.
//
// Either way, the conversation starts with this multiplication.

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://db:5432/app");
        config.setMaximumPoolSize(10);          // be honest about your math
        config.setConnectionTimeout(2000);      // fail fast, not slow
        config.setMaxLifetime(1_800_000);       // 30min — recycle to dodge stale conns
        return new HikariDataSource(config);
    }
}`}</CodeBlock>

        <h3>Putting it together: design TinyURL</h3>

        <p>
          The classic warm-up question. Let&apos;s size the whole thing in five minutes.
        </p>

        <WorkedExample
          title="Design TinyURL: end-to-end back-of-envelope"
          subtitle="100M new URLs/day. Read-heavy. Five minutes; pen and paper."
          steps={[
            {
              title: "Step 1 — State the assumptions",
              body: (
                <>
                  <p>100M new URLs created per day. Read:write ratio of 100:1 (URLs are visited many times after creation). Each short code is 7 chars (base62 = 62^7 ≈ 3.5 trillion possible codes — plenty of headroom).</p>
                  <p>Long URLs average ~200 bytes (most fit in 100, some are huge with query params).</p>
                  <p>Replication factor 3x. Plan for 5 years.</p>
                </>
              ),
            },
            {
              title: "Step 2 — Write QPS",
              body: (
                <>
                  <p>100M / 86,400 ≈ <strong>~1,200 average write QPS</strong>. Peak 2-3x: <strong>~3,000 peak write QPS</strong>.</p>
                  <p>That&apos;s tiny. A single Postgres handles this trivially. No write sharding needed for years.</p>
                </>
              ),
            },
            {
              title: "Step 3 — Read QPS",
              body: (
                <>
                  <p>100:1 read:write ratio means <strong>~120,000 average read QPS</strong>, peak <strong>~300,000</strong>.</p>
                  <p>Now we&apos;re in &quot;cache or die&quot; territory. A single DB at 300k QPS is not happening; this is what Redis is for.</p>
                </>
              ),
            },
            {
              title: "Step 4 — Storage",
              body: (
                <>
                  <p>Per row: ~7 bytes short code + ~200 bytes long URL + ~50 bytes metadata (timestamps, owner) ≈ <strong>~260 bytes/row</strong>.</p>
                  <p>100M rows/day × 260 bytes = ~26GB/day raw. ×3 replication = ~80GB/day. ×365 days ×5 years ≈ <strong>~150TB over 5 years</strong>.</p>
                  <p>Big enough to think about, small enough that a single sharded Postgres or a NoSQL key-value store handles it without breaking a sweat.</p>
                </>
              ),
            },
            {
              title: "Step 5 — Bandwidth",
              body: (
                <>
                  <p>Read response = HTTP redirect ≈ ~500 bytes including headers. 300k peak QPS × 500 bytes = <strong>~150 MB/s ≈ 1.2 Gbps</strong>.</p>
                  <p>One server&apos;s NIC saturates at 1 Gbps. So even at the cache layer, you can&apos;t do this on one box. You need at least 2-4 cache nodes — and that&apos;s what we&apos;d expect anyway for HA.</p>
                </>
              ),
            },
            {
              title: "Step 6 — Cache memory",
              body: (
                <>
                  <p>If we keep a 10% hot set in cache: 10% × 5-year row count = 10% × 180B rows × 260 bytes ≈ <strong>~5 TB</strong>. Too big for one machine; sharded Redis cluster (10-20 nodes with 256-512GB each) handles it.</p>
                  <p>For the &quot;recently created, hottest right now&quot; subset — say, last 30 days — it&apos;s ~3B rows × 260 bytes ≈ ~750GB. Easy on a 2-3 node Redis cluster.</p>
                </>
              ),
            },
            {
              title: "The takeaway",
              body: (
                <>
                  <p>In about five minutes of arithmetic, the architecture wrote itself: a small write path (single sharded DB), a heavy read path (cache cluster), and a clear bandwidth constraint that forces multiple front-end nodes.</p>
                  <p>You haven&apos;t drawn a box yet. <strong>The math told you what the boxes have to be.</strong> That&apos;s the move.</p>
                </>
              ),
            },
          ]}
        />

        <Callout variant="spring" title="Spring shortcut for hot cache reads">
          <p className="m-0">For TinyURL&apos;s read path you&apos;d typically front the DB lookup with a Caffeine local cache plus a Redis distributed cache. Spring makes the local layer one annotation: <code>@Cacheable(&quot;urls&quot;)</code> on the resolver method. Redis is a few more lines (Spring Data Redis). The interview point isn&apos;t the annotation — it&apos;s that you knew you needed two cache tiers from the QPS math, before you wrote any code.</p>
        </Callout>

        <Quiz
          kind="Reality check"
          question="You're designing a chat app where each user maintains a persistent WebSocket. You expect 5M concurrent connected users at peak. Your team wants to run it on 10 servers. Is that realistic?"
          options={[
            { label: "Yes, easy — modern Linux handles 1M conns/box.", explanation: "1M conns/box is heroic, not easy. It requires aggressive kernel tuning (file descriptors, ephemeral port range, TCP buffers) and a non-blocking event loop. Most teams can't actually pull this off." },
            { label: "Probably not — 500k connections per box is at the edge of normal tuning. You'd want 50–100 servers to land in the comfortable zone.", correct: true, explanation: "Right. 100k connections per box is achievable without heroics; 500k requires real tuning; 1M is research-paper territory. For 5M concurrent at peak, planning for ~50 servers (100k each) gives you headroom and a realistic Java/Netty footprint. Add more for HA and rolling deploys." },
            { label: "No way — TCP only allows 65,535 connections per machine.", explanation: "Common myth. The 64k port limit applies to outbound connections from a single source IP to a single destination IP and port. Inbound listeners can accept far more — each accepted connection is a separate socket, not a port." },
            { label: "Depends entirely on the language — Java can't do it, Go can.", explanation: "Both Java (Netty) and Go can do this comfortably. The constraint is OS tuning and memory per connection, not the language runtime." },
          ]}
        />

        <Quiz
          kind="Drill"
          question="A video service streams ~3 Mbps per active viewer. At peak you have 200k concurrent viewers. Your origin server has a single 10 Gbps NIC. Without a CDN, what happens?"
          options={[
            { label: "Fine — 10 Gbps is plenty for 200k viewers.", explanation: "Recompute: 200k × 3 Mbps = 600 Gbps. The NIC is a 10 Gbps link. You're 60x over budget." },
            { label: "You're at ~60x your bandwidth budget — you cannot serve this from one origin. CDN or multiple origins are mandatory.", correct: true, explanation: "Right. 600 Gbps required vs 10 Gbps available. This is exactly why every video service in the world fans out via CDN — the origin only serves cache fills, not end users. The bandwidth math forces the architecture, same as the read-QPS math forced caching for TinyURL." },
            { label: "Roughly fine if you compress harder.", explanation: "You can't compress your way out of a 60x gap, and 3 Mbps is already aggressive H.264/H.265 for streaming." },
            { label: "Depends on disk throughput.", explanation: "Disk throughput matters but isn't the bottleneck here — the NIC is, by 60x." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Storage, bandwidth, connections, memory. Four axes, same arithmetic."
          points={[
            { takeaway: "Always size all four axes — getting one right and missing another still breaks the design.", detail: <>The TinyURL example showed it: QPS math said &quot;cache it,&quot; storage math said &quot;sharded store,&quot; bandwidth math said &quot;multiple front-end nodes.&quot; Each axis added a constraint.</> },
            { takeaway: "Per-server rules of thumb: 10-50k QPS for stateless work, 100k WebSockets per box (with tuning), 1 Gbps ≈ 125 MB/s.", detail: <>These are deliberately approximate. The point is to know whether the answer is &quot;1 box,&quot; &quot;10,&quot; &quot;100,&quot; or &quot;impossible without architecture changes.&quot;</> },
            { takeaway: "Bandwidth is invisible until it isn't.", detail: <>Most people only check QPS and storage. Bandwidth blindsides you when payloads are big — video, photos, large JSON. Always include it in the math; it&apos;s the axis that often forces a CDN.</> },
            { takeaway: "The math derives the architecture. Draw boxes after, not before.", detail: <>If you sketch boxes first, you&apos;re bringing your bias. If you do the math first, the boxes fall out: this number says cache, that number says shard, this third number says CDN.</> },
          ]}
        />
      </section>
      </Checkpoint>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Up next: the scaling ladder</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          You can now produce numbers. Module 2 is about what to <em>do</em> with them — vertical, horizontal, stateless, cache, shard, async, in that order, and the conditions that move you up each rung.
        </p>
        <Link
          href="/courses/system-design/modules/scaling-ladder"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-blue-600 transition no-underline"
        >
          Module 2: The scaling ladder →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="back-of-envelope" />
    </article>
  );
}
