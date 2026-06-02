import Link from "next/link";
import Callout from "@/components/Callout";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

export default function Page() {
  const mod = getModuleBySlug("welcome")!;

  return (
    <article className="prose-custom">
      {/* content-lint-disable count — counts here are framed as "after this
          welcome": "the next forty-nine modules" = 50 total − this orientation
          module, and the per-phase bullets (Phases 1–8) sum to those 49. */}
      <nav className="mb-6 text-xs">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-slate-500 to-slate-400 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Welcome</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Read this first. It&apos;s five minutes and it sets up the way the next forty-nine modules are going to talk to you.
        </p>
        <BookmarkButton courseId="system-design" moduleSlug="welcome" />
      </header>

      <section>
        <h2>What &quot;system design&quot; actually means here</h2>
        <p>
          &quot;System design&quot; is one of the most overloaded phrases in our industry. It can mean a 45-minute whiteboard interview where someone asks you to design Twitter. It can mean the architecture document you write before a real launch. It can mean the dozen quiet decisions a senior engineer makes every week about queues, caches, schemas, and timeouts.
        </p>
        <p>
          This course treats all three as the same skill. Because they are. The interview problem is just the production problem with the deadline compressed and the stakes simulated. If you can defend a real design at work, you can defend one in an interview. If you can defend one in an interview but every system you ship melts under load, something has gone wrong and we&apos;re going to fix it.
        </p>
        <p>
          So we&apos;ll teach the patterns the way senior engineers actually use them, as a vocabulary for tradeoffs, not as a checklist of correct answers.
        </p>
      </section>

      <section>
        <h2>Who this is for</h2>
        <p>
          You&apos;re a working Java engineer, two-to-five years out of school. You ship Spring services. You&apos;ve seen Kafka in anger, you&apos;ve probably written a circuit breaker, you&apos;ve definitely been paged at 3am because a queue backed up. You can write the code. What you&apos;re building now is the layer above the code: <strong>the ability to reason about a system at the level of components, traffic, and failure modes.</strong>
        </p>
        <p>
          You want two things from this course, and you can have both:
        </p>
        <ul>
          <li><strong>Pass a senior system-design interview cleanly.</strong>{" "}Walk in, ask the right clarifying questions, do the back-of-envelope math out loud, propose an architecture, defend the tradeoffs. No memorized templates.</li>
          <li><strong>Make better calls at work.</strong>{" "}Pick the right datastore. Know when to add a queue. Recognize when someone&apos;s proposing a saga because it&apos;s genuinely needed vs because they read a blog post.</li>
        </ul>
      </section>

      <section>
        <h2>Why &quot;layered&quot;</h2>
        <p>
          Most system-design content drops you straight into &quot;design Twitter&quot; on day one. That&apos;s like teaching DSA by opening with hard graph problems, you spend the whole hour pattern-matching to fragments you half-remember, you never build real intuition, and you forget it all by next month.
        </p>
        <p>
          This course is structured the opposite way. Phase 1 is fundamentals, the math and concepts every later module will lean on. Phase 2 is storage. Phase 3 is communication. Phase 4 is reliability. Phase 5 is the hard distributed-systems primitives. Phase 6, the case studies, the &quot;design Twitter&quot; stuff, pulls all of that together. Phase 7 is the production discipline (migrations, security) and the capstone. Phase 8 closes with frontend system design, the same patterns applied to the browser. By the time you get there, every word in the case studies is something you&apos;ve already built up.
        </p>
        <p>The nine phases:</p>
        <ul>
          <li><strong>Phase 0 · Orientation</strong>, this module.</li>
          <li><strong>Phase 1 · Foundations (5 modules)</strong>, back-of-envelope math, the scaling ladder, CAP/PACELC, consistency models, plus a phase-revision card. The vocabulary.</li>
          <li><strong>Phase 2 · Storage Layer (8 modules)</strong>, SQL vs NoSQL, indexing, sharding, replication, caching, distributed cache, search, plus a phase-revision card.</li>
          <li><strong>Phase 3 · Communication (6 modules)</strong>, APIs, gateways, queues, Kafka, event-driven/CQRS, plus a phase-revision card.</li>
          <li><strong>Phase 4 · Reliability &amp; Operations (7 modules)</strong>, load balancing, rate limiting, Resilience4j, idempotency, observability, on-call, plus a phase-revision card.</li>
          <li><strong>Phase 5 · Distributed Systems Deep (6 modules)</strong>, consensus, distributed transactions, clocks, geo, capacity, plus a phase-revision card.</li>
          <li><strong>Phase 6 · Case Studies (9 modules)</strong>, interview framework, TinyURL, news feed, Twitter, chat, rate limiter, rideshare, payments, plus a phase-revision card. The famous interview problems, but with the foundations to actually defend each move.</li>
          <li><strong>Phase 7 · Production &amp; Capstone (4 modules)</strong>, migration, security, recap, capstone.</li>
          <li><strong>Phase 8 · Frontend System Design (4 modules)</strong>, rendering strategies and Core Web Vitals, feed UI, real-time UI, plus a phase-revision card.</li>
        </ul>
      </section>

      <section>
        <h2>How each module works</h2>
        <p>
          Every module after this one follows the same shape:
        </p>
        <ol>
          <li><strong>Concept first.</strong>{" "}The intuition, the analogy, the &quot;why does this exist&quot;, before any code or names.</li>
          <li><strong>Names of the patterns.</strong>{" "}CAP. Saga. Outbox. Quorum. Token bucket. The names matter because they&apos;re how senior engineers communicate. When you say &quot;we&apos;ll do read-your-writes via sticky session,&quot; the room knows the shape of your fix in five words.</li>
          <li><strong>Java where it matters.</strong>{" "}If a pattern has a clean Spring expression, <code>@Async</code>, Resilience4j, Spring Kafka, Caffeine, we&apos;ll show it. We won&apos;t pad with toy code that doesn&apos;t earn its place.</li>
          <li><strong>Tradeoffs, named.</strong>{" "}Every &quot;best practice&quot; depends on context. Every module ends with the conditions under which the pattern is wrong.</li>
          <li><strong>Quizzes and recaps.</strong>{" "}Active recall, not passive reading. The course progresses when you answer correctly, not when you scroll.</li>
        </ol>
        <Callout variant="info" title="Concept-first, not Java-first">
          <p className="m-0">Phase 1 is conceptual on purpose. CAP isn&apos;t a Java thing, it&apos;s a property of distributed systems. We don&apos;t force-feed it through a code example. Once we hit Phase 2, the Java tilt picks up sharply. By Phase 4 most modules ship with a small Spring lab.</p>
        </Callout>
      </section>

      <section>
        <h2>The course&apos;s point of view</h2>
        <p>
          Every course has a worldview. Here&apos;s ours, stated up front so you know what you&apos;re signing up for:
        </p>
        <ul>
          <li><strong>Tradeoffs over rules.</strong> &quot;Always do X&quot; is the mark of someone who hasn&apos;t been bitten by X yet. The whole game is knowing when each pattern is right and when it&apos;s overkill.</li>
          <li><strong>Numbers over vibes.</strong> &quot;A lot of QPS&quot; is not a design input. &quot;~30k peak QPS, 5KB payloads, p99 under 200ms&quot; is. We&apos;ll do the math, in writing, every time.</li>
          <li><strong>Boring tech wins.</strong>{" "}Postgres, Kafka, Redis, S3, a load balancer, a queue. Most real systems are 80% boring and 20% interesting. The interesting parts only earn their complexity when the boring stack runs out of room.</li>
          <li><strong>Names matter.</strong> &quot;Add a saga&quot; is a complete sentence to a senior engineer. Building the shared vocabulary is half of why this course exists.</li>
          <li><strong>Production reality, not whiteboard reality.</strong>{" "}A design that wins the interview but melts under real load is not a design. We&apos;ll always close the loop on what production-grade looks like.</li>
        </ul>
      </section>

      <section>
        <h2>What you&apos;ll be able to do by the end</h2>
        <ul>
          <li><strong>Walk into a senior system-design interview</strong>{" "}and run the room: clarify, estimate, propose, defend, deepen. With confidence, not memorization.</li>
          <li><strong>Read a real design doc</strong>{" "}and immediately see the tradeoffs nobody wrote down, what happens during a partition, where the consistency boundaries are, what the queue depth is on a bad day.</li>
          <li><strong>Make the call</strong>{" "}at work between &quot;cache it,&quot; &quot;shard it,&quot; &quot;queue it,&quot; or &quot;leave it alone&quot;, and have a one-paragraph defense for each.</li>
          <li><strong>Talk to senior engineers</strong>{" "}in their own vocabulary, CAP, sagas, outbox, quorum reads, fanout-on-write, without faking it.</li>
        </ul>
      </section>

      <section>
        <h2>How to actually study</h2>
        <ol>
          <li><strong>Do the math out loud.</strong>{" "}Whenever a module hands you a back-of-envelope, do it on paper before you read the answer. The skill is producing the number under interview pressure, not recognizing it on a page.</li>
          <li><strong>Defend every pattern.</strong>{" "}When a module introduces, say, fanout-on-write, ask yourself: <em>when is this wrong?</em>{" "}If you can&apos;t answer in one sentence, you don&apos;t actually understand the pattern yet. Re-read.</li>
          <li><strong>Don&apos;t skip Phase 1.</strong>{" "}The four foundation modules feel abstract. Skip them and the case studies in Phase 6 will feel like memorization instead of derivation. CAP and consistency are load-bearing for everything later.</li>
          <li><strong>Treat each case study like a real interview.</strong>{" "}Phase 6 modules are designed to be timed. Forty-five minutes, paper and pen, talk through the design before you read the walkthrough.</li>
        </ol>
        <Callout variant="insight" title="The single biggest mistake">
          <p className="m-0">It&apos;s reading system-design content passively. People read &quot;Designing Data-Intensive Applications,&quot; nod a lot, and then bomb their first interview because they never had to <em>produce</em>{" "}a design under time pressure. This course is built to force production. Every quiz, every recap, every case study is a small reps of the real thing.</p>
        </Callout>
      </section>

      <section>
        <h2>What you&apos;ll need</h2>
        <ul>
          <li><strong>Java 17+</strong>{" "}and IntelliJ (or your IDE of choice). We&apos;ll touch Spring Boot 3.x in the labs.</li>
          <li><strong>Comfort with HTTP, threads, and SQL basics.</strong>{" "}No deep prior distributed-systems knowledge required, we build it.</li>
          <li><strong>Paper and a pen.</strong>{" "}Every back-of-envelope and every architecture sketch is faster on paper than in your editor. Yes, really.</li>
          <li><strong>An hour a day, ish.</strong>{" "}Modules average 1.5–2.5 hours. Phase 1 is ~7 hours total. The full course is roughly <strong>80–100 hours</strong>{" "}of engaged work.</li>
        </ul>
      </section>

      <section className="mt-12 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 dark:border-cyan-900 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Ready?</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Module 1 is back-of-envelope estimation, the math you&apos;ll do out loud in every interview and every design review for the rest of your career.
        </p>
        <Link
          href="/courses/system-design/modules/back-of-envelope"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-cyan-600 hover:to-blue-600 hover:shadow-md"
        >
          Start Module 1: Back-of-envelope estimation →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="welcome" />
    </article>
  );
}
