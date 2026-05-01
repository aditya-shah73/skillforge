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

const CHECKPOINTS = [
  { id: "framework", title: "The framework" },
  { id: "pitfalls", title: "Common pitfalls" },
  { id: "communication", title: "Communicating in the room" },
];

const frameworkDiagram = `flowchart LR
  A[Clarify<br/>~5 min] --> B[Estimate<br/>~5 min]
  B --> C[API + Data<br/>~10 min]
  C --> D[High-level<br/>~5 min]
  D --> E[Scale & deep dive<br/>~15 min]
  E --> F[Wrap + tradeoffs<br/>~5 min]
  style A fill:#fce7f3,stroke:#db2777
  style B fill:#fce7f3,stroke:#db2777
  style C fill:#fef3c7,stroke:#d97706
  style D fill:#dbeafe,stroke:#2563eb
  style E fill:#dcfce7,stroke:#16a34a
  style F fill:#ede9fe,stroke:#7c3aed`;

export default function Page() {
  const mod = getModuleBySlug("interview-framework")!;

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
        <ModuleProgress moduleSlug="interview-framework" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-fuchsia-300 dark:border-fuchsia-800 bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/40 dark:to-pink-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📐</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          A repeatable structure for any open-ended &quot;design X&quot; question — clarify, estimate, API, data, scale, tradeoffs — and the meta-skill of communicating that structure to your interviewer in 45 minutes.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>The 6 phases of a system design interview and how long each gets</li>
          <li>The questions to ask before drawing a single box</li>
          <li>How to do back-of-envelope math without panicking</li>
          <li>The pitfalls that fail otherwise-strong candidates</li>
          <li>How to talk through the design — pacing, drawing, when to push back</li>
        </ul>
      </section>

      <section>
        <h2>The interview is a conversation, not a quiz</h2>
        <p>
          Here&apos;s the thing nobody tells you: the system design interview isn&apos;t really about whether your final architecture is &quot;correct.&quot; There is no single correct architecture. What the interviewer is testing is whether you can take an ambiguous prompt, ask the right questions to make it concrete, do the math, propose something that works, and reason out loud about its tradeoffs — all under time pressure, while a stranger watches.
        </p>
        <p>
          Strong candidates fail this interview by being smart about the wrong things. They jump straight to &quot;I&apos;d use Kafka and Cassandra&quot; before asking a single clarifying question. They sketch a beautiful architecture without doing the QPS math. They wave their hands at the data model and burn 30 minutes on caching minutiae. The framework in this module is the antidote: a sequence that forces you to spend your time where it matters.
        </p>
        <p>
          This is the meta-module for Phase 6. The next four modules — TinyURL, news feed, Twitter, chat — all walk through this exact framework with concrete content. So learn the rhythm here, and the case studies become reps.
        </p>
      </section>

      <Checkpoint moduleSlug="interview-framework" id="framework" title="Part 1 · The framework" xp={25}>
        <h2>The 6-phase rhythm (call it RESHAD if you need a mnemonic)</h2>
        <p>
          You have roughly 45 minutes. Not 60 — there&apos;s usually intro, behavioral chat, and a wrap-up that eats the rest. So your design budget is about 45 minutes, and you need to spend it deliberately. Here&apos;s the rhythm I want you to internalize:
        </p>
        <Mermaid chart={frameworkDiagram} />
        <p>
          Six phases, roughly proportional to the time each deserves. The names don&apos;t matter (call it RESHAD: Requirements, Estimate, Schema/API, High-level, Adapt to scale, Discuss tradeoffs). What matters is the sequence — and the discipline to not skip steps.
        </p>

        <h3>Phase 1 — Clarify (~5 min)</h3>
        <p>
          The prompt &quot;Design Twitter&quot; is intentionally vague. Twitter has a million features. Your first job is to pin down what we&apos;re actually building. Two buckets of questions:
        </p>
        <p>
          <strong>Functional requirements</strong> — what does the system <em>do</em>? Post tweets? Read a timeline? Search? DMs? Trending? Most prompts in 45 minutes need 3-4 core features, not 12. Pick a tight scope and get the interviewer&apos;s buy-in: &quot;I&apos;ll focus on posting tweets, the home timeline, and following users — does that match what you had in mind?&quot;
        </p>
        <p>
          <strong>Non-functional requirements</strong> — how <em>well</em> does it have to do those things? Read-heavy or write-heavy? What&apos;s the latency budget (p99 100ms? 500ms?)? How available — three nines, four, five? Strongly consistent or eventually? What&apos;s the scale (DAU, QPS)?
        </p>
        <p>
          You&apos;ll often need to assume some answers when the interviewer waves you off. That&apos;s fine. Say the assumption out loud: &quot;I&apos;ll assume read-heavy, roughly 100:1 reads to writes, and we can tolerate a few seconds of staleness on the timeline.&quot; Now both of you are operating on the same assumptions and they can correct you if those assumptions matter for what they&apos;re testing.
        </p>

        <h3>Phase 2 — Estimate (~5 min)</h3>
        <p>
          Back-of-envelope math. The point is not exact precision — the point is to figure out which constraints actually bite. A system at 100 QPS and a system at 100,000 QPS are completely different designs. You need a number, even a rough one, before you start drawing.
        </p>
        <p>
          The standard quick math: DAU, requests-per-user-per-day, peak-vs-average multiplier (typically 2-3x for peak), storage per record, retention. If you covered Phase 1 of this course you have the latency numbers in your back pocket already.
        </p>
        <CodeBlock lang="plain" caption="Quick estimation worksheet">{`DAU                              200M
Requests / user / day             20  (reads + writes)
Total requests / day              4B
Average QPS                       4B / 86400 ≈ 46k QPS
Peak QPS (3x average)             ~140k QPS

Storage per record                500 bytes
New records / day                 200M  (1 write/user/day average)
New storage / day                 100 GB
Annual storage growth             ~36 TB`}</CodeBlock>
        <p>
          Five lines of math and you suddenly know: this needs more than one machine, your write path needs to handle 50k+ QPS at peak, and you&apos;re looking at 30+ TB/year of storage. That immediately rules out &quot;just put it in one Postgres&quot; and unlocks the rest of the design.
        </p>

        <h3>Phase 3 — API + Data model (~10 min)</h3>
        <p>
          Now you can be concrete. Define 3-5 endpoints with realistic signatures. Don&apos;t over-engineer — a Java method signature, a request shape, a response shape. The point is to anchor what the system <em>does</em> in code that you and the interviewer both understand.
        </p>
        <CodeBlock lang="java" caption="API surface — make it look like real Spring code">{`@PostMapping("/tweets")
public TweetResponse postTweet(
    @RequestHeader("X-User-Id") long userId,
    @Valid @RequestBody PostTweetRequest req
);

@GetMapping("/users/{userId}/timeline")
public TimelinePage getHomeTimeline(
    @PathVariable long userId,
    @RequestParam(required = false) String cursor,
    @RequestParam(defaultValue = "20") int limit
);

@PostMapping("/users/{targetId}/follow")
public void follow(
    @RequestHeader("X-User-Id") long userId,
    @PathVariable long targetId
);`}</CodeBlock>
        <p>
          Then the data model. Tables (or KV keys, or document shapes — whatever fits) with the columns/fields that matter. Don&apos;t list every field; list the ones that affect access patterns, indexing, and sharding decisions. If you&apos;re using Postgres + Redis, show both: a few SQL tables and a few Redis key patterns.
        </p>

        <h3>Phase 4 — High-level architecture (~5 min)</h3>
        <p>
          Now you can draw boxes. Client → CDN → Load balancer → API service → Cache + DB + Queue. Keep it simple at first — five boxes, arrows, labels on the arrows for what flows through. Don&apos;t add components you can&apos;t justify.
        </p>
        <p>
          The mistake here is to over-decorate. You don&apos;t need a Kafka cluster on the diagram in minute 5 unless you can name the workload it&apos;s carrying. Every box should map to something from your API or data model.
        </p>

        <h3>Phase 5 — Scale and deep-dive (~15 min)</h3>
        <p>
          This is where most of the actual signal lives. Pick the 2-3 hot subproblems your earlier estimation revealed, and go deep. For Twitter: the timeline fanout problem and the celebrity hot key. For TinyURL: the read-heavy cache strategy and the key-generation scheme. For chat: connection management and message ordering.
        </p>
        <p>
          For each deep-dive, follow the same micro-pattern: <strong>name the problem</strong>, <strong>propose 2-3 approaches</strong>, <strong>compare them on the relevant axis</strong> (latency, write amplification, complexity), <strong>pick one and say why</strong>. That&apos;s a complete deep-dive in 4-5 minutes if you&apos;re tight, and the interviewer can stop you mid-stream to redirect.
        </p>

        <h3>Phase 6 — Wrap and tradeoffs (~5 min)</h3>
        <p>
          End strong. Walk back to the top of your diagram and say what you&apos;d revisit if you had more time, what the failure modes are, what you&apos;d monitor, what you punted on intentionally. This is where you signal that you understand the system isn&apos;t finished — you just had 45 minutes.
        </p>

        <Callout variant="insight" title="The four dimensions of 'good design'">
          <p className="m-0">When you&apos;re evaluating tradeoffs, score against four axes: <strong>correctness</strong> (does it satisfy the requirements?), <strong>scalability</strong> (does it handle the QPS and storage you estimated?), <strong>reliability</strong> (what happens when things fail — single-AZ outage, hot key, downstream timeout?), <strong>simplicity</strong> (could a junior engineer be on-call for this?). Strong candidates name two or three of these explicitly when justifying choices.</p>
        </Callout>

        <h3>The classifier: which step does each question belong in?</h3>
        <p>
          Before we move on, drill the framework by mapping common interview moves to phases. Same skill you&apos;ll use in the room — recognize what phase you&apos;re in and what you should be doing right now.
        </p>
        <ClassifyChallenge
          title="Map the move to the phase"
          prompt="The interviewer or you yourself just said the following. Which phase does this belong in?"
          buckets={[
            { id: "clarify", label: "Clarify", color: "rose" },
            { id: "estimate", label: "Estimate", color: "amber" },
            { id: "api-data", label: "API + Data", color: "emerald" },
            { id: "scale", label: "Scale & deep-dive", color: "indigo" },
          ]}
          items={[
            { id: "qps", label: "'If we have 200M DAU and each posts twice a day, that's 400M writes/day or about 4.6k average write QPS, peak maybe 14k.'", answer: "estimate", explanation: "Pure back-of-envelope math. Belongs in Phase 2, before any architecture." },
            { id: "scope", label: "'Should I include direct messages, or just focus on the public timeline?'", answer: "clarify", explanation: "Scoping the functional requirements. Always Phase 1 — get this nailed before drawing anything." },
            { id: "celeb", label: "'For users with more than 1M followers, fanout-on-write becomes the bottleneck. Let me show how I'd handle that with a hybrid pull approach.'", answer: "scale", explanation: "Naming a hot subproblem and proposing an approach is exactly what Phase 5 is for." },
            { id: "endpoint", label: "'getTimeline(userId, cursor, limit) returns a page of tweets ordered by timestamp, with cursor-based pagination.'", answer: "api-data", explanation: "Concrete endpoint signature — Phase 3. This anchors the rest of the design." },
            { id: "consistency", label: "'Are stale reads OK, or do we need read-your-writes for the user's own posts?'", answer: "clarify", explanation: "Non-functional requirement — consistency model. Surface it during clarification before assuming." },
            { id: "shard", label: "'The tweets table at 30TB/year needs sharding. I'd shard by user_id with consistent hashing.'", answer: "scale", explanation: "Deep-dive on a subproblem that the estimate revealed. Phase 5 territory." },
            { id: "table", label: "'Tweet table: id, author_id, text, created_at, indexed on (author_id, created_at desc).'", answer: "api-data", explanation: "Schema design. Phase 3, alongside the API surface." },
          ]}
        />

        <Quiz
          question="A candidate is given 'Design TinyURL.' They say 'Got it' and immediately start drawing a load balancer, API gateway, and database. What did they skip?"
          options={[
            { label: "They skipped clarification and estimation. Without functional/non-functional requirements and rough QPS math, they're drawing an architecture for an imaginary scale.", correct: true, explanation: "Right. The first 10 minutes (clarify + estimate) drive the rest of the design. Skip them and you're committing to an architecture before you know the constraints." },
            { label: "They skipped naming the framework explicitly.", explanation: "You don't need to announce 'I will now use the RESHAD framework.' The framework shapes your work; you don't recite it." },
            { label: "Nothing — fast architecture sketches signal experience.", explanation: "Speed without grounding signals memorization. The interviewer wants to see that you can adapt to the actual requirements, which you don't have yet." },
            { label: "They skipped the data model.", explanation: "They'll get there, but the first miss is much earlier — they jumped to architecture without requirements or scale numbers." },
          ]}
          hint="What two phases come before drawing boxes?"
          xp={7}
        />

        <Quiz
          question="In the 45-minute design budget, which phase tends to carry the most signal for the interviewer?"
          options={[
            { label: "Phase 5 — scale and deep-dive. That's where you reason about real tradeoffs on a hot subproblem and where senior judgement shows up.", correct: true, explanation: "Yes. Anyone can draw boxes. The deep-dive is where you compare approaches, pick one, and justify it under pressure — that's the most diagnostic part of the interview." },
            { label: "Phase 1 — clarify. If you ask the right questions, the rest writes itself.", explanation: "Clarification is necessary but not sufficient. A great clarifier with a weak deep-dive doesn't pass." },
            { label: "Phase 4 — high-level architecture. The diagram is the artifact the interviewer remembers.", explanation: "The diagram matters but it's descriptive. Senior signal lives in the analysis of the hot subproblems, not the boxes themselves." },
            { label: "Phase 6 — wrap. A strong summary anchors the whole interview.", explanation: "A strong wrap helps but it's 5 minutes. The 15-minute deep-dive is where most of the evaluative signal is." },
          ]}
          hint="Which phase gets the most minutes?"
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Six phases — clarify, estimate, API+data, high-level, scale, wrap — proportioned to the 45-minute budget. The deep-dive carries the most signal."
          points={[
            { takeaway: "Clarify before drawing", detail: "5 minutes of functional + non-functional questions saves you from designing for the wrong scale, the wrong consistency, or the wrong feature set." },
            { takeaway: "Math anchors architecture", detail: "QPS, storage, peak multiplier — five lines of estimation tell you whether you need one box or one hundred. Without it you're guessing." },
            { takeaway: "API + data is the contract", detail: "Concrete endpoint signatures and a sketched schema make the rest of the design legible. Junior candidates skip this; senior candidates lean on it." },
            { takeaway: "Deep-dives get the most time and signal", detail: "Pick 2-3 hot subproblems, propose 2-3 approaches each, compare on the axis that matters, pick one and say why." },
            { takeaway: "End with tradeoffs", detail: "What you'd revisit, what failure modes you punted on, what you'd monitor. Signals that you know the system isn't done — you just had 45 minutes." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="interview-framework" id="pitfalls" title="Part 2 · Common pitfalls" xp={25}>
        <h2>The five ways smart candidates fail this interview</h2>
        <p>
          I&apos;ve seen these patterns across hundreds of mock interviews. None of them are about lack of knowledge. They&apos;re all about misallocating the 45 minutes — spending energy on the wrong axis at the wrong moment.
        </p>

        <h3>Pitfall 1 — Jumping to architecture without requirements</h3>
        <p>
          Candidate hears &quot;Design Twitter,&quot; and within 60 seconds is sketching microservices and Kafka topics. The problem: you&apos;re committing to a scale and feature set the interviewer hasn&apos;t signed off on. Maybe the interviewer wants you to focus on the timeline and DM is out of scope. Maybe they want a 10k-user version, not 200M. You&apos;re solving a different problem than the one being asked.
        </p>
        <p>
          The fix: <strong>force yourself to ask 3 questions before drawing anything.</strong> What features matter? What&apos;s the read/write ratio? What&apos;s the rough scale? You can do this in 2 minutes and it shapes everything else.
        </p>

        <h3>Pitfall 2 — Hand-waving the estimation</h3>
        <p>
          &quot;It&apos;ll be high QPS so we need to scale.&quot; That&apos;s not estimation; that&apos;s a vibe. Without numbers you can&apos;t tell whether your design needs sharding, just replicas, or just a bigger box. And if you can&apos;t do back-of-envelope math under pressure, the interviewer assumes you can&apos;t do it on the job either.
        </p>
        <p>
          The fix: <strong>practice the standard formula until it&apos;s automatic.</strong> DAU × actions/day = total daily ops. Divide by 86,400 for average QPS. Multiply by 3 for peak. Multiply storage-per-record by daily ops for daily storage growth. Five operations, every interview, every time. Slow down and write the numbers down — out loud is fine, on the whiteboard is better.
        </p>

        <Callout variant="warn" title="The 'I'll use Kafka and Cassandra' antipattern">
          <p className="m-0">If your first sentence after &quot;Design X&quot; names specific technologies, you&apos;re doing it wrong. Technology choices come <em>after</em> you know the constraints. Naming Kafka before you&apos;ve estimated write QPS is like prescribing a medication before taking the patient&apos;s temperature — it might be the right answer, but you have no way to know yet, and the interviewer can&apos;t evaluate your reasoning because you didn&apos;t do any.</p>
        </Callout>

        <h3>Pitfall 3 — Skipping the data model</h3>
        <p>
          Candidates often draw a beautiful service-level architecture and then wave at &quot;and there&apos;s a database.&quot; That&apos;s a tell. The data model is where the access patterns live, and the access patterns are what determine whether your architecture works. If you can&apos;t show what a row looks like and how the hot query reads it, you don&apos;t actually know if your design works.
        </p>
        <p>
          The fix: <strong>always sketch at least one table or KV pattern explicitly.</strong> &quot;Tweet table has these columns, indexed by (user_id, created_at desc), sharded by user_id.&quot; That sentence carries more signal than 10 minutes of microservice naming.
        </p>

        <h3>Pitfall 4 — No explicit tradeoffs</h3>
        <p>
          Candidate proposes &quot;use Cassandra for the timeline.&quot; Interviewer asks &quot;why not Postgres?&quot; Candidate freezes. The fix isn&apos;t to memorize databases — it&apos;s to make the tradeoff explicit when you propose the choice, not when challenged. &quot;I&apos;ll use Cassandra here because the workload is write-heavy and tolerates eventual consistency; Postgres would force me to shard manually and pay vertical-scale costs for write QPS we don&apos;t need to be transactional.&quot;
        </p>
        <p>
          That sentence does three things: names the alternative, names the axis (write QPS, consistency), names the cost. Practice that sentence shape until it&apos;s muscle memory.
        </p>

        <h3>Pitfall 5 — Going deep on the wrong subproblem</h3>
        <p>
          A candidate spends 10 minutes on which CDN to use, while the actual hard problem in the design — the celebrity fanout, or the consensus protocol, or the geo-routing — sits unaddressed. Time gets eaten and the interviewer never sees you reason about what they&apos;re actually testing.
        </p>
        <p>
          The fix: <strong>at the start of Phase 5, name the 2-3 hardest problems out loud and ask the interviewer which to dig into.</strong> &quot;The hard parts here are timeline fanout for celebrities, the read cache strategy, and tweet ingestion at peak. Which would you like me to deep-dive first?&quot; That single sentence calibrates the rest of the interview.
        </p>

        <h3>The senior &quot;I would also...&quot; pattern</h3>
        <p>
          Here&apos;s a power move that costs almost nothing: when you make a choice, mention the thing you&apos;re <em>not</em> doing and why. &quot;I&apos;d use Redis as a write-through cache for the hot timeline. I would also consider write-behind for higher throughput, but it makes failure recovery messier — happy to dig into that if useful.&quot;
        </p>
        <p>
          That sentence shows you know the alternative exists, you&apos;ve thought about why you&apos;re not picking it, and you&apos;re willing to go deeper if asked. It signals depth without spending time. Use it 3-4 times in the interview.
        </p>

        <CodeBlock lang="java" caption="The 'tradeoff sentence' shape — practice this">{`// Pattern: [Choice] because [axis-1, axis-2].
// I considered [alternative] but [cost on axis we care about].

// Example:
"I'll use Redis sorted sets for the home timeline cache because
 the workload is read-heavy and we need O(log N) range scans by
 timestamp. I considered an in-memory ConcurrentSkipListMap on
 each app node, but it doesn't survive restarts and we'd lose
 cache warmth on every deploy."`}</CodeBlock>

        <Callout variant="info" title="When to push back on the prompt">
          <p className="m-0">If the interviewer&apos;s prompt has a contradiction or seems to be pointing you at a bad design, push back politely. &quot;You said strongly consistent and 5ms p99 globally — those two are in tension. Did you want me to assume one region, or are we OK with eventual cross-region?&quot; That&apos;s not insubordination; it&apos;s exactly the senior signal they&apos;re looking for. The interviewer often baked the contradiction in deliberately to see if you&apos;d catch it.</p>
        </Callout>

        <Quiz
          question="A candidate proposes 'use Cassandra for the timeline storage.' The interviewer pushes back: 'Why not Postgres?' What's the strongest response shape?"
          options={[
            { label: "Name the axes that drove the choice (write QPS, consistency tolerance), name what Postgres would cost on those axes (manual sharding, vertical scale, sync replication latency), and acknowledge the upside Postgres has (transactions, joins) that this workload doesn't need.", correct: true, explanation: "That's the tradeoff sentence shape: name the axes, name the alternative's cost on those axes, acknowledge what you're giving up. Demonstrates you considered the alternative rather than reflexively reaching for the trendy answer." },
            { label: "'Cassandra is web-scale; Postgres doesn't scale.'", explanation: "Postgres scales fine for many workloads, including some Twitter-scale ones with the right sharding. This answer signals you're using a slogan instead of reasoning." },
            { label: "'That's a good question, let me think... actually, let's go with Postgres then.'", explanation: "Flipping at the first pushback is worse than picking wrong. Stand by your reasoning or update it explicitly — don't collapse." },
            { label: "'Postgres would also work; I just like Cassandra.'", explanation: "Preference isn't reasoning. The whole question is 'why this and not that on the axes that matter for this workload?'" },
          ]}
          hint="Name the axis, name the alternative's cost on that axis, acknowledge the alternative's upside."
          xp={7}
        />

        <Quiz
          question="You're 25 minutes in. You've done clarify, estimate, API/data, and high-level. The interviewer asks you to deep-dive. You can either dig into (A) the celebrity fanout problem, which is hard and central, or (B) the CDN configuration, which is easier and you have a lot to say about. Which do you pick?"
          options={[
            { label: "(A) — celebrity fanout. Pick the hardest, most-central subproblem so the interviewer sees you reason on something that actually tests senior judgement. The CDN is wallpaper next to that.", correct: true, explanation: "Right. Time is finite and the interviewer is scoring on signal density. The hardest subproblem is where the most signal lives — even if you only get part-way through it, that's worth more than a complete tour of an easy subproblem." },
            { label: "(B) — CDN. Show off depth on something you know well, build confidence, then move to the harder problem.", explanation: "By the time you finish the easy thing, you'll be out of time for the hard one. The interviewer wanted to see you on the celebrity fanout; you optimized for your comfort instead." },
            { label: "Ask the interviewer to choose for you.", explanation: "Asking which subproblem to dig into is great. But if you have a strong opinion on which is more central, lead with that — 'I think the celebrity fanout is the hardest part; OK if I start there?'" },
            { label: "Both, switching every 3 minutes.", explanation: "You'll do neither well. Pick the one that shows the most signal and commit to depth over breadth in this phase." },
          ]}
          hint="Where is the most senior judgement on display?"
          xp={6}
        />

        <PartRecap
          title="Part 2 recap"
          gist="The pitfalls aren't about knowledge gaps — they're about misspending the 45-minute budget. Force the rhythm and these go away."
          points={[
            { takeaway: "Don't draw before you've clarified", detail: "3 questions in 2 minutes calibrate the rest of the interview. Skip them and you're solving a problem that may not be the one asked." },
            { takeaway: "Estimation is non-negotiable", detail: "Five lines of math. DAU × actions ÷ 86400 × peak ratio. Storage per record × daily ops. Without numbers, the design has no anchor." },
            { takeaway: "Sketch at least one table", detail: "Showing how the hot query hits the data model carries more signal than 10 minutes of high-level box-drawing." },
            { takeaway: "Make tradeoffs explicit when you propose, not when challenged", detail: "'X because A, not Y, which would cost B' — that sentence shape, repeated, is what senior judgement sounds like under pressure." },
            { takeaway: "Spend deep-dive time on the hardest subproblem", detail: "Name the 2-3 hard parts up front, let the interviewer pick if you're not sure, then go deep. Don't fritter the budget on easy wins." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="interview-framework" id="communication" title="Part 3 · Communicating in the room" xp={25}>
        <h2>The interview is a performance, not a paper</h2>
        <p>
          You can have the right architecture in your head and still fail if you don&apos;t communicate it well. The interviewer is grading on your reasoning <em>process</em>, not just the final state of your whiteboard. So treat the conversation itself as a deliverable.
        </p>

        <h3>Whiteboard discipline</h3>
        <p>
          Your drawing is your shared workspace. Keep it readable. A few rules I&apos;ve seen the strongest candidates follow:
        </p>
        <ul>
          <li><strong>Boxes for components, arrows for data flow, labels on every arrow.</strong> An unlabeled arrow is just a vibe — what flows through it? &quot;tweet write&quot;, &quot;timeline read&quot;, &quot;async fanout job&quot;.</li>
          <li><strong>Direction matters.</strong> Single arrow for one-way (writes to a queue), double-headed only when there&apos;s genuinely bidirectional sync request/response.</li>
          <li><strong>Don&apos;t erase. Strike through.</strong> If you change your mind about a component, cross it out and redraw — the interviewer wants to see your evolving thinking, not a clean final state.</li>
          <li><strong>Section your space.</strong> Top of the board: requirements + estimation. Middle: API + data. Bottom: architecture diagram. Side: scratch math. Don&apos;t mix.</li>
        </ul>

        <h3>Pacing — the 45-minute clock</h3>
        <p>
          Roughly track the clock in your head. If you&apos;re 15 minutes in and still clarifying, you&apos;ve over-spent. If you&apos;re 30 minutes in and haven&apos;t deep-dived, you need to move. A useful trick: at every phase boundary, say it out loud. &quot;OK, I think I&apos;ve got the requirements. Let me move to estimation.&quot; That signals to the interviewer (and to yourself) that you&apos;re managing the budget.
        </p>
        <p>
          If you&apos;re running long on a phase, the interviewer will often help — they&apos;ll redirect you. But don&apos;t wait for them; <strong>self-pace.</strong> Better to wrap a phase 80% complete and move on than to nail one phase and run out of time for the rest.
        </p>

        <h3>Talking through, not at</h3>
        <p>
          Pause every 2-3 minutes and check in. &quot;Does this match what you had in mind?&quot; &quot;Want me to dig into this further or move on?&quot; The interviewer has signal they want to extract; if they&apos;re not getting it, they&apos;ll redirect you. If you&apos;re monologuing for 8 minutes straight, you&apos;ve missed those opportunities.
        </p>
        <p>
          When you don&apos;t know something — say so, then reason about it. &quot;I&apos;m not sure of the exact write throughput a single Kafka partition can handle, but I think it&apos;s in the tens of thousands per second on commodity hardware. Let me size assuming 30k/sec/partition and we can revisit if needed.&quot; That&apos;s much stronger than guessing a number with false confidence, and it shows you know how to operate under uncertainty.
        </p>

        <Callout variant="info" title="When to ask vs assume">
          <p className="m-0">If the question is core to the design — read/write ratio, scale, consistency — <strong>ask</strong>. If it&apos;s a detail that doesn&apos;t change your architecture — exact retention, exact CDN vendor — <strong>assume out loud</strong>. The signal you&apos;re sending: &quot;I know which decisions are load-bearing.&quot; A candidate who asks 12 questions about details signals they can&apos;t triage; one who assumes everything signals they can&apos;t scope.</p>
        </Callout>

        <h3>The structure of a deep-dive</h3>
        <p>
          When the interviewer asks you to go deep on a subproblem, follow this micro-structure. It&apos;s the same shape as the macro framework, just compressed:
        </p>
        <CodeBlock lang="plain" caption="Deep-dive micro-structure (~5 min each)">{`1. Name the problem        "The celebrity fanout problem is..."
                            (state the constraint that makes it hard)

2. Propose 2-3 approaches  "There are a few ways to handle this:
                            (a) fanout-on-write,
                            (b) fanout-on-read,
                            (c) hybrid push/pull."

3. Compare on the axis     "Fanout-on-write blows up for celebrities
                            (200 writes per follower x 100M followers).
                            Fanout-on-read is N database reads per
                            timeline view. Hybrid trades complexity
                            for both wins."

4. Pick and justify        "I'd go hybrid — push for normal users,
                            pull-and-merge for users above ~1M followers.
                            Threshold is tunable based on read/write cost."

5. Note what you'd test    "I'd verify the threshold empirically — the
                            crossover depends on follower distribution."`}</CodeBlock>
        <p>
          That&apos;s a tight, complete deep-dive. 5 steps, 3-5 minutes, transferable across any subproblem. Practice it on familiar problems first (caching, sharding, queue choice) until the structure is automatic — then it&apos;s available to you under interview pressure.
        </p>

        <h3>The wrap — last 5 minutes</h3>
        <p>
          When you sense time is running out, claim a wrap. &quot;Want me to spend the last few minutes on what I&apos;d revisit?&quot; That signals time-awareness. Then hit three things:
        </p>
        <ol>
          <li><strong>What I&apos;d revisit if I had more time</strong> — components you sketched but didn&apos;t deep-dive. &quot;I&apos;d look at how the search service indexes and the trending pipeline; both are real problems I punted on.&quot;</li>
          <li><strong>Failure modes I&apos;m worried about</strong> — single-AZ outage, hot keys, queue backpressure. Naming a failure you didn&apos;t fully solve is a senior signal, not a weakness.</li>
          <li><strong>What I&apos;d monitor</strong> — at minimum p99 latency, write QPS, queue depth, cache hit rate. Bonus: an SLO and an error budget.</li>
        </ol>

        <Callout variant="insight" title="The hidden grading rubric">
          <p className="m-0">Interviewers are usually scoring on something like: did the candidate <strong>scope</strong> the problem? Did they <strong>quantify</strong> it? Did they <strong>design</strong> something that matches the scope? Did they <strong>defend</strong> their choices? Did they <strong>recognize</strong> what they didn&apos;t solve? Each of those maps to a phase of the framework. If you walk through the framework, you&apos;re hitting every category by construction.</p>
        </Callout>

        <Quiz
          question="You're 35 minutes in, deep into the celebrity fanout. The interviewer asks 'how would you handle a regional outage?' What's the strongest move?"
          options={[
            { label: "Briefly answer the regional-outage question (2 min, name multi-region active-passive or active-active and the cost), then ask if they want you to go deeper or wrap with what you'd revisit.", correct: true, explanation: "Right. Honor the question with a quick concrete answer, then surface the meta-decision (deeper vs wrap) since you're running short on time. That's pacing + responsiveness in one move." },
            { label: "Spend the next 8 minutes deep-diving regional failover.", explanation: "You'll burn the wrap. The interviewer asked a question, not for a full deep-dive — calibrate the answer to the time you have." },
            { label: "Say 'I'd use multi-region' and immediately pivot back to celebrity fanout.", explanation: "Too dismissive. The interviewer asked because they want to see you reason about it. One-line answers signal you didn't engage." },
            { label: "Apologize for not having time to cover it and skip.", explanation: "Never skip a direct question. Answer concisely, even briefly, before redirecting." },
          ]}
          hint="What does pacing look like at 35 minutes in?"
          xp={7}
        />

        <Quiz
          question="The interviewer asks: 'How big do you think the metadata records would be?' You don't know exactly. What's the right move?"
          options={[
            { label: "'I don't know the exact number, but I'd estimate 200-500 bytes — short text, a few timestamps, some IDs. Let me size with 500 to be safe.' Then proceed.", correct: true, explanation: "Yes. Honest about uncertainty, ranges instead of false precision, picks a value to make progress, and signals you'd revisit. That's exactly the operating-under-uncertainty pattern interviewers want to see." },
            { label: "'Around 100 bytes.' Pick a number with confidence and move on.", explanation: "False precision is worse than a range. If you're wrong by 5x, your storage estimate is wrong by 5x, and the interviewer can tell you guessed." },
            { label: "'I'd need to know more about the schema before I can answer.' Punt.", explanation: "You're showing you can't make progress under uncertainty. The whole point of estimation is to operate with rough numbers and refine later." },
            { label: "'Let's skip storage estimation and focus on QPS.'", explanation: "Storage and QPS are both load-bearing — skipping one will bite you in deep-dive. Estimate even with a wide range." },
          ]}
          hint="Honest, range-based, picks a value, moves on."
          xp={6}
        />

        <PartRecap
          title="Part 3 recap"
          gist="The interview is a performance under time pressure. Whiteboard discipline, pacing, structured deep-dives, and a deliberate wrap are what separate a passable design from a passing one."
          points={[
            { takeaway: "Boxes, labeled arrows, sectioned space", detail: "An unlabeled arrow is a vibe. Section your whiteboard so the interviewer can scan requirements, math, API, and architecture without hunting." },
            { takeaway: "Self-pace; announce phase transitions", detail: "'OK, moving to estimation.' Helps both of you track where you are in the 45-minute budget without you waiting to be redirected." },
            { takeaway: "Ask for load-bearing decisions, assume the rest", detail: "Read/write ratio: ask. CDN vendor: assume. Knowing which decisions matter is itself a senior signal." },
            { takeaway: "Deep-dives have a 5-step shape", detail: "Name problem → propose approaches → compare on axis → pick and justify → note what you'd verify. Practice until automatic." },
            { takeaway: "Wrap with revisit + failure + monitor", detail: "What you'd come back to, failure modes you're worried about, what you'd alert on. Signals senior maturity in 3 minutes." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Now you have a framework — go practice it</h2>
        <p>
          The next four modules walk through this exact framework on real prompts: TinyURL, news feed, Twitter, chat. Each one is shaped like the framework you just learned — clarify, estimate, API, data, scale, deep-dive. Read them as worked examples, not reference docs. Cover the diagrams with your hand and try to predict what the next phase says before you read it.
        </p>
        <p>
          The framework gets tighter with reps. By the third case study you&apos;ll feel the rhythm without thinking about it. That&apos;s when you&apos;re ready for a real interview.
        </p>
      </section>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Design TinyURL — the canonical warm-up. URL shortener at scale, where the read-heavy ratio and the key-generation tradeoff are the two things you&apos;ll deep-dive on.
        </p>
        <Link
          href="/courses/system-design/modules/design-tinyurl"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-blue-600 transition no-underline"
        >
          Continue to Design TinyURL →
        </Link>
      </section>
    </article>
  );
}
