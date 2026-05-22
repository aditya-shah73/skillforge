import Link from "next/link";
import Callout from "@/components/Callout";
import { getModuleBySlug } from "@/lib/modules";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

export default function WelcomeModule() {
  const mod = getModuleBySlug("welcome")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/ai" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-slate-500 to-slate-400 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 0 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Read this first. It&apos;s five minutes and will save you hours.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="welcome" />
      </header>

      <section>
        <h2>Who this is for</h2>
        <p>
          You&apos;re a working full-stack engineer — comfortable in <strong>Java/Spring</strong>{" "}on the backend, <strong>React</strong>{" "}on the frontend, maybe <strong>GraphQL</strong>{" "}or REST in between. You ship features. You&apos;ve never trained a model and you&apos;re not trying to become an ML researcher.
        </p>
        <p>
          What you want: to <em>actually understand</em>{" "}what&apos;s happening when you call Claude, add a vector database, wire up an agent, or stream tokens into a React app — and then ship production-quality AI features at your day job.
        </p>
        <p>That&apos;s exactly what this course is for.</p>
      </section>

      <section>
        <h2>What this course <em>is</em></h2>
        <ul>
          <li><strong>Hands-on, not theory-only.</strong>{" "}Every module ends with a project you build. Most in Java.</li>
          <li><strong>Intuition first, math second.</strong>{" "}Every concept starts with an analogy, then the formula, then a worked example with real numbers.</li>
          <li><strong>Interactive.</strong>{" "}Quizzes, drills, and checkpoints. You don&apos;t progress by clicking &quot;next&quot; — you progress by answering correctly.</li>
          <li><strong>Opinionated.</strong>{" "}We&apos;ll tell you when to use agents (rarely), when RAG is overkill, and when a plain prompt is the right answer.</li>
        </ul>
      </section>

      <section>
        <h2>What this course is <em>not</em></h2>
        <ul>
          <li><strong>Not a Python/PyTorch course.</strong>{" "}You&apos;ll implement ML from scratch in Java to build real intuition, then move to production tools (Spring AI, Claude API) for the rest.</li>
          <li><strong>Not a prompt-engineering-only course.</strong>{" "}Prompting is one module. The rest is backend engineering, retrieval systems, evals, and production concerns.</li>
          <li><strong>Not a credential.</strong>{" "}There&apos;s no certificate. The portfolio project at the end <em>is</em>{" "}the credential.</li>
        </ul>
      </section>

      <section>
        <h2>What you&apos;ll need</h2>
        <ul>
          <li><strong>Java 21+</strong>{" "}and your IDE of choice (IntelliJ recommended)</li>
          <li><strong>Node 20.9+</strong>{" "}to run this course app locally</li>
          <li>An <strong>Anthropic API key</strong> (from Phase 2 onward) — budget $5–10 for the entire course</li>
          <li><strong>Docker</strong>{" "}for Postgres + pgvector in Phase 3</li>
          <li>Working knowledge of <strong>Spring Boot</strong>, <strong>React</strong>, and either REST or GraphQL</li>
        </ul>
        <Callout variant="info" title="No prior ML experience required">
          <p className="m-0">If you&apos;ve never heard of gradient descent or can&apos;t explain what a neural network does — perfect. Start at Module 1 and the course builds every concept up from zero.</p>
        </Callout>
      </section>

      <section>
        <h2>How the course works</h2>
        <p>
          The syllabus is <strong>28 modules across 7 phases</strong>. You&apos;re reading the first one right now. Each module is a single page with the same rhythm:
        </p>
        <ol>
          <li><strong>Analogy</strong> — the intuition, before any math</li>
          <li><strong>Formula</strong> — with every symbol explained</li>
          <li><strong>Worked example</strong> — by hand, with real numbers</li>
          <li><strong>Variants</strong> — what changes in practice, and why</li>
          <li><strong>Checkpoint</strong> — a quiz that tests the three bars below</li>
        </ol>
        <p>
          A checkpoint passes only when you can do three things:
        </p>
        <ul>
          <li>Explain the concept in <strong>2 minutes</strong> (without jargon)</li>
          <li><strong>Recognize it in code</strong>{" "}you didn&apos;t write</li>
          <li><strong>Implement it from scratch</strong>{" "}in Java</li>
        </ul>
        <p>
          If you can&apos;t do all three, go back. The modules are designed so that skipping the reinforcement wrecks the next module.
        </p>
      </section>

      <section>
        <h2>Time commitment</h2>
        <p>
          Budget ranges are listed per module, but roughly:
        </p>
        <ul>
          <li><strong>Phase 1 (ML &amp; AI Foundations):</strong> ~15–22 hours</li>
          <li><strong>Phase 2 (API &amp; Backend):</strong> ~8–10 hours</li>
          <li><strong>Phase 3 (Vector Search &amp; RAG):</strong> ~8 hours</li>
          <li><strong>Phase 4 (Frontend AI):</strong> ~5 hours</li>
          <li><strong>Phase 5 (Agents):</strong> ~6 hours</li>
          <li><strong>Phase 6 (Production &amp; Capstone):</strong> ~7–8 hours</li>
        </ul>
        <p>
          Total: ~50–60 hours of focused work. The &quot;30-day&quot; framing is for people doing ~1.5–2 hours a day. Go faster or slower — the modules don&apos;t know.
        </p>
      </section>

      <section>
        <h2>Progress tracking</h2>
        <p>
          Your progress lives in your browser&apos;s <code>localStorage</code>. Clearing site data wipes it. There&apos;s no account, no server, no tracking. If you switch browsers or machines, you&apos;ll start fresh.
        </p>
        <Callout variant="warn" title="One quirk to know">
          <p className="m-0">Some quizzes have a hidden state: they only mark as &quot;passed&quot; when you answer correctly. If you&apos;re scrolling past them without interacting, the module won&apos;t unlock its next section. Engage with every quiz — that&apos;s the whole point.</p>
        </Callout>
      </section>

      <section>
        <h2>How to get the most out of this</h2>
        <ol>
          <li><strong>Actually do the projects.</strong>{" "}Reading Java code that someone else wrote is not the same as writing it. The from-scratch ML code in Phase 1 feels tedious but <em>builds the mental model</em>{" "}that makes everything else click.</li>
          <li><strong>Don&apos;t skip the worked examples.</strong>{" "}When a module says &quot;compute this by hand&quot; — pull out paper and do it. Five minutes of arithmetic beats an hour of re-reading theory.</li>
          <li><strong>Ship the capstone.</strong>{" "}Module 32 is a portfolio centerpiece. Put it on GitHub. Link it from your resume. That&apos;s the point of the whole course.</li>
        </ol>
      </section>

      <section className="mt-12 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-indigo-900 dark:from-indigo-950/40 dark:to-purple-950/40">
        <h3 className="mt-0 mb-2">Ready?</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Module 1 is a 15-minute intro to tokenization — the first thing that ever surprised you about an LLM bill.
        </p>
        <Link
          href="/courses/ai/modules/tokenization"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Start Module 1 →
        </Link>
      </section>
        <ModuleNav courseId="ai" currentSlug="welcome" />
    </article>
  );
}
