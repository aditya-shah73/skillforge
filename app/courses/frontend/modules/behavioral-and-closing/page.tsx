import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "behavioral-and-closing";

const CHECKPOINTS = [
  { id: "cp-star", title: "STAR & your story bank" },
  { id: "cp-tradeoffs-weakness", title: "Tradeoffs, disagreement & weakness" },
  { id: "cp-closing", title: "Their questions & closing strong" },
];

export default function BehavioralAndClosingModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 9 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Behavioral answers &amp; closing strong — tradeoffs, disagreement, and questions to ask
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          You aced the coding round. Then they ask &quot;tell me about a time you disagreed with a teammate&quot; and your
          mind goes blank — or worse, you ramble for four minutes and blame your old tech lead. The behavioral round
          isn&apos;t a softball; it&apos;s where offers are won and lost. Let&apos;s make it the easiest part of your day.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The interview is a job, and you&apos;re both interviewing</h2>
        <p className="mb-4">
          Picture two people on a first date who&apos;ve each decided, before they sit down, that the <em>other</em> person
          is the one being judged. One performs — rehearsed anecdotes, laughing too hard, never asking a real question.
          The other sits back and quietly evaluates. The performer leaves thinking it went great. The evaluator leaves
          knowing exactly whether there&apos;s a fit. Guess who has the power.
        </p>
        <p className="mb-4">
          A behavioral round is the same dynamic. The candidate who treats it as a one-way exam — &quot;please like me&quot; —
          rambles, over-explains, and accepts whatever they&apos;re told. The candidate who treats it as a <em>mutual
          evaluation</em> answers crisply, names tradeoffs without flinching, pushes back when something doesn&apos;t add up,
          and asks the interviewer questions that reveal how the team actually works. The second candidate reads as
          senior <strong>even when their years of experience are identical</strong>, because seniority is a posture, not
          a tenure.
        </p>
        <p className="mb-4">
          Everything in this module is in service of one shift: stop auditioning, start evaluating. You do that with
          <strong> structured stories</strong> (so you never ramble), <strong>honest tradeoffs and ownership</strong> (so
          you sound like someone who has shipped), and <strong>good questions back</strong> (so you signal you&apos;re sizing
          them up too). The interviewer feels the difference immediately.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            The behavioral round measures things the coding round can&apos;t: can you communicate under mild pressure, do
            you own outcomes, do you handle disagreement like an adult, and would the team want you in the room at 4pm on
            a Friday when something&apos;s on fire. None of that is improvised well. It&apos;s prepared — into a small bank of
            reusable, structured stories you can recombine to answer almost any prompt.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. STAR ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">STAR — the structure that stops you rambling</h2>
        <p className="mb-4">
          The single most common behavioral failure is the shapeless answer: you start in the middle, backtrack to add
          context, jump to the outcome, circle back to a detail, and three minutes later the interviewer has no idea
          what you actually <em>did</em>. STAR fixes that by giving every story the same four beats, in order:
        </p>
        <pre><code>{`S — SITUATION   one or two sentences of context. Where, when, what was at stake.
T — TASK        what specifically was YOUR responsibility / the problem to solve.
A — ACTION      what YOU did. The bulk of the answer. "I", not "we".
R — RESULT      how it turned out — ideally with a number — and what you learned.`}</code></pre>
        <p className="mb-4">
          The proportions matter as much as the order. Situation and Task are setup — keep them tight, maybe 20% of the
          answer. <strong>Action is the heart</strong> — 60% — and it must be in the first person, because the
          interviewer is hiring <em>you</em>, not your old team. Result lands the plane: what changed, measured if you
          can, plus a sentence of reflection. Here&apos;s the shape filled in for a hard bug:
        </p>
        <pre><code>{`S: "Last year our checkout page started intermittently showing the wrong
    order total — only in production, only sometimes. Revenue-impacting,
    and no one could reproduce it locally."

T: "I owned the checkout flow, so it was on me to find the root cause
    before we lost more conversions over the weekend."

A: "I started by adding structured logging around the total calculation
    so I could see real production inputs. The logs showed two requests
    racing — a stale price response was overwriting a newer one. I
    reproduced it by artificially delaying the API, confirmed the race,
    and fixed it by keying the cached result to the request and ignoring
    superseded responses. I added a regression test that fired requests
    out of order."

R: "The wrong-total reports went to zero, and the regression test caught
    a similar race in a different component two months later. The lesson
    I took: 'can't reproduce locally' usually means a timing or
    environment difference, so instrument production first instead of
    guessing."`}</code></pre>
        <p className="mb-4">
          Notice that the Action is concrete and sequential — instrument, observe, reproduce, fix, prevent — and the
          Result has a measurable outcome (<em>reports went to zero</em>) plus a transferable lesson. That last sentence
          is what separates a war story from a sign of growth.
        </p>
        <Callout variant="insight" title="Say 'I', and quantify the Result">
          <p>
            Two habits carry most STAR answers. First, narrate the <strong>Action in the first person</strong> — &quot;I
            added logging,&quot; not &quot;we looked into it.&quot; Interviewers can&apos;t give credit they can&apos;t attribute. Second,
            <strong> put a number on the Result</strong> whenever one exists: &quot;cut p95 load time from 4s to 1.2s,&quot;
            &quot;reduced bug reports by 90%,&quot; &quot;saved the team ~5 hours a week.&quot; A measured result is the difference between
            &quot;I think it helped&quot; and &quot;here&apos;s the impact.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. STORY BANK ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The story bank — prepare five, answer fifty</h2>
        <p className="mb-4">
          You cannot prepare a unique story for every possible prompt, and you shouldn&apos;t try. The trick is that the
          dozens of behavioral questions out there map onto a handful of <em>themes</em>. Prepare one strong,
          STAR-structured story for each theme below, and you can recombine and re-angle them to answer almost anything
          they throw at you:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>A hard bug / technical challenge.</strong> Something genuinely tricky you debugged or built. Shows depth and persistence.</li>
          <li><strong>A conflict / disagreement.</strong> A time you disagreed with a teammate or manager and navigated it. Shows maturity.</li>
          <li><strong>A project you led / drove.</strong> Something you owned end to end, even informally. Shows initiative and ownership.</li>
          <li><strong>A failure &amp; what you learned.</strong> A real miss — not a humblebrag — and the concrete change you made after. Shows self-awareness.</li>
          <li><strong>A measurable improvement.</strong> A time you made something faster, cleaner, or cheaper, with a number. Shows impact.</li>
        </ul>
        <p className="mb-4">
          The same project can serve multiple themes from different angles. The checkout-race story above is a &quot;hard
          bug&quot; answer — but reframed around the Result, it&apos;s also a &quot;measurable improvement&quot; answer, and if you had to
          convince a skeptical teammate the race was real, it becomes a &quot;disagreement&quot; answer too. One well-mined
          experience covers a lot of ground.
        </p>
        <p className="mb-4">
          Map the question to the theme, then tell the prepared story. A quick translation table you can build in your
          head:
        </p>
        <pre><code>{`"Tell me about a challenge"         -> hard bug story
"A time you disagreed"             -> conflict story
"Something you're proud of"        -> project-you-led story
"A time you failed / a mistake"    -> failure story
"A time you took initiative"       -> project-you-led story
"How do you handle pressure"       -> hard bug story (the prod one)
"A time you improved a process"    -> measurable-improvement story`}</code></pre>
        <Callout variant="warn" title="Don't pick the 'failure' that's secretly a brag">
          <p>
            &quot;My biggest failure is that I care too much&quot; or &quot;I worked too hard&quot; is a non-answer, and interviewers have
            heard it a thousand times. Pick a <em>real</em> failure with a real cost — a bug you shipped, a deadline you
            blew, a teammate you steamrolled — and spend most of the answer on what you <strong>changed</strong> as a
            result. The failure is the setup; the lesson and the behavior change are the point.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 4. TELL ME ABOUT YOURSELF ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">&quot;Tell me about yourself&quot; — the 90-second arc</h2>
        <p className="mb-4">
          This is almost always the opener, and almost everyone botches it by reciting their résumé chronologically from
          birth. It&apos;s not a memory test — it&apos;s your chance to <em>frame</em> the rest of the conversation. Think of it
          as a 90-second arc with three beats: present, past, future.
        </p>
        <pre><code>{`PRESENT  "I'm a front-end engineer focused on React and design systems —
          right now I'm at [company] working on [the thing that's most
          relevant to THIS role]."

PAST     "I got here by [one or two sentences of the throughline] — I
          started in [X], moved into front end because [reason], and the
          work I'm proudest of is [the project that maps to this role]."

FUTURE   "What I'm looking for next is [thing this role offers] — which is
          exactly why this role caught my eye."`}</code></pre>
        <p className="mb-4">
          The whole thing is 60–90 seconds, not five minutes. It&apos;s <em>tailored</em> — you emphasize the parts of your
          background that line up with this job, and quietly skip the parts that don&apos;t. And it ends pointed at the
          future, which hands the interviewer an obvious follow-up (&quot;what about this role appeals to you?&quot;) and signals
          that you&apos;re here on purpose, not just shopping every posting.
        </p>
        <Callout variant="insight" title="End on why THIS role">
          <p>
            The future beat is the one most people drop, and it&apos;s the most valuable. Closing with &quot;what I want next lines
            up with what this team is doing&quot; reframes the whole interview from &quot;evaluate this candidate&quot; to &quot;explore this
            mutual fit.&quot; It&apos;s the first place in the conversation you get to act like an evaluator instead of an
            applicant.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-star" moduleSlug={MODULE_SLUG} title="STAR & your story bank">
        <Quiz
          kind="STAR structure"
          question="In a STAR answer, which section should be the longest, and in what voice?"
          options={[
            {
              label: "Action — the bulk of the answer, told in the first person ('I did X'), because the interviewer is hiring you, not your team",
              correct: true,
              explanation:
                "Right. Situation and Task are tight setup; Action is ~60% of the answer and must be 'I', not 'we', so the interviewer can attribute the work to you. Result lands the plane with a measured outcome.",
            },
            {
              label: "Situation — you need lots of context up front so the story makes sense",
              explanation:
                "Situation is setup, not substance. Spending most of your time on context is how answers ramble. Keep S and T to ~20% and put the weight on what YOU did.",
            },
            {
              label: "Result — interviewers only care about the outcome, so lead with it and keep the rest brief",
              explanation:
                "The Result matters (and should be quantified), but it lands because of the Action that earned it. An outcome with no visible 'what I did' reads as luck, not skill.",
            },
          ]}
        />
        <Quiz
          kind="Story bank"
          question="Why prepare a small bank of ~5 themed stories instead of one story per possible question?"
          options={[
            {
              label: "The many behavioral questions map onto a few themes, so a handful of strong stories can be recombined and re-angled to answer almost anything",
              correct: true,
              explanation:
                "Exactly. One well-mined experience can serve as a 'hard bug', a 'measurable improvement', and a 'disagreement' answer depending on the angle. Map the question to a theme, then tell the prepared story.",
            },
            {
              label: "Because interviewers ask the exact same five questions everywhere",
              explanation:
                "They don't — the wording varies enormously. The point isn't that questions are identical; it's that they cluster into a few themes you can prepare for.",
            },
            {
              label: "So you can memorize each answer word-for-word and recite it verbatim",
              explanation:
                "Verbatim recitation sounds robotic and breaks the moment they ask a follow-up. You prepare the structure and the beats, then deliver them conversationally — not from a script.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 5. TRADEOFFS & OWNERSHIP ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Talking about tradeoffs &amp; ownership</h2>
        <p className="mb-4">
          The fastest way to sound senior in any answer — technical or behavioral — is to <strong>name the
          tradeoff</strong>. Juniors describe decisions as if there was one obvious right answer. Seniors describe them
          as choices between competing goods, made deliberately, with the cost acknowledged out loud:
        </p>
        <pre><code>{`Junior:  "We used a library for it."
Senior:  "We chose the library over hand-rolling it. It cost us a
          dependency and some bundle size, but it bought us the race-
          condition handling and caching for free, which mattered because
          we had a dozen endpoints to ship that quarter. If we'd only had
          one, I'd have hand-rolled it."`}</code></pre>
        <p className="mb-4">
          The senior version names the <em>cost</em> (dependency, bundle size), the <em>benefit</em> (free correctness,
          velocity), the <em>reason</em> the benefit won (a dozen endpoints), and the <em>boundary</em> where the call
          would flip (just one endpoint). That last part — &quot;here&apos;s when I&apos;d decide differently&quot; — is the strongest
          signal of all, because it proves you made a judgment rather than followed a habit.
        </p>
        <p className="mb-4">
          The cousin of tradeoff-awareness is <strong>ownership</strong>. When a story involves a bad outcome, resist
          the urge to narrate yourself as a bystander to whom things happened. Own your slice plainly, even when others
          shared the blame:
        </p>
        <pre><code>{`Deflecting:  "The deadline slipped because QA was slow and the requirements
              kept changing."
Owning:      "The deadline slipped. Looking back, my part was that I didn't
              flag the scope creep early enough — I kept absorbing changes
              quietly instead of saying 'this is now a different project.'
              Now I raise scope changes the day I notice them."`}</code></pre>
        <Callout variant="insight" title="Ownership is attractive, not risky">
          <p>
            People fear that admitting fault makes them look weak. The opposite is true: owning a mistake cleanly signals
            confidence and makes everything else you say more credible. The deflector sounds like someone who&apos;ll blame
            <em> you</em> next time. The owner sounds like someone you can trust with hard things. Own your part, state
            the lesson, move on — don&apos;t grovel, and don&apos;t over-explain.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 6. DISAGREEMENT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Handling &quot;you&apos;re wrong&quot; — disagreement without rigidity</h2>
        <p className="mb-4">
          Some interviewers will push back on something you said — sometimes because they disagree, sometimes purely to
          see how you react. This is a test of <em>collaboration under tension</em>, and there are two ways to fail it:
          collapse instantly (&quot;oh, you&apos;re right, never mind&quot;) or dig in defensively (&quot;no, I&apos;m definitely right&quot;).
          Neither is what a good teammate does. The move that passes is a small, repeatable script:
        </p>
        <pre><code>{`1. ACKNOWLEDGE   "That's a fair point — let me make sure I follow."
2. RESTATE       "You're saying [their position], because [their reason]."
3. ENGAGE        "Where I'd push back is [your reasoning] — but I might be
                  missing context."
4. CONVERGE      "How about we [test it / measure it / try the smaller
                  version first]? That'd tell us which way to go."`}</code></pre>
        <p className="mb-4">
          The shape is: hear them, prove you heard them, offer your view as a view (not a verdict), and propose a way to
          <em> resolve it with evidence</em> rather than by who&apos;s more stubborn. If they make a genuinely better point,
          updating is a strength: &quot;Actually, that changes my mind — I hadn&apos;t considered the mobile case.&quot; Changing your
          position <em>because of a good argument</em> is the opposite of weakness; it&apos;s exactly what you want on a team.
        </p>
        <p className="mb-4">
          When you tell a <em>past</em> disagreement story, use the same spine and end on the relationship, not the win:
          &quot;We disagreed about whether to rewrite or refactor. I laid out the risk of the rewrite, they laid out the
          tech-debt cost of refactoring, we agreed to time-box a refactor spike and reassess. We went with the refactor
          — and the teammate and I worked together fine afterward.&quot; The interviewer is checking whether you can disagree
          and still have a working relationship the next morning.
        </p>
        <Callout variant="warn" title="Never win the story by making the other person dumb">
          <p>
            The fastest way to fail a disagreement question is to make your counterpart sound foolish — &quot;they just
            didn&apos;t understand how promises work, so I explained it to them.&quot; Even if true, it reads as someone hard to
            work with. Frame the other person as reasonable with a different priority, and frame the resolution as
            collaborative. You can be right <em>and</em> generous.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. WEAKNESS & I DON'T KNOW ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">&quot;What&apos;s your weakness&quot; — and &quot;I don&apos;t know&quot;</h2>
        <p className="mb-4">
          The weakness question is a sincerity test disguised as a trap. The wrong answers are the fake-weakness
          (&quot;perfectionism&quot;) and the disqualifying-weakness (&quot;I miss deadlines a lot&quot;). The right answer is a
          <strong> real, non-fatal weakness plus the concrete thing you do to manage it</strong>:
        </p>
        <pre><code>{`Template:  [a genuine weakness]
           + [why it's a weakness / where it bit you]
           + [the specific system or habit you use to manage it]

Example:   "I tend to go too deep on polishing details before getting
            feedback — early on I'd disappear for two days perfecting
            something only to find I'd built the wrong thing. So now I
            force myself to share a rough version within the first few
            hours and let the feedback steer the polish. It's still my
            instinct to over-polish, but the early-share habit keeps it
            in check."`}</code></pre>
        <p className="mb-4">
          That answer is believable (it&apos;s a real tendency), non-disqualifying (it doesn&apos;t mean you can&apos;t do the job),
          and — crucially — shows <em>self-awareness plus a system</em>. The weakness is the setup; the management
          strategy is the payoff. Same shape as the failure story.
        </p>
        <p className="mb-4">
          Closely related is what to do when you simply <strong>don&apos;t know something</strong> they ask. Do not bluff —
          experienced interviewers smell it instantly and it&apos;s far more damaging than the gap itself. Instead, say what
          you do know, name the boundary honestly, and show how you&apos;d find out:
        </p>
        <pre><code>{`"I haven't worked with [X] directly, so I don't want to guess at the
 specifics. What I do know is [the adjacent thing], and the way I'd get up
 to speed is [docs / a small spike / asking whoever owns it]. My hunch is
 [reasoned guess], but I'd verify before relying on it."`}</code></pre>
        <Callout variant="insight" title="'I don't know, but here's how I'd find out' is a strong answer">
          <p>
            Nobody knows everything, and the job is mostly figuring out things you didn&apos;t know yesterday. An honest
            &quot;I don&apos;t know that, but here&apos;s my approach to learning it&quot; demonstrates exactly the skill the job requires.
            A confident bluff that falls apart under one follow-up demonstrates the opposite — and it poisons trust in
            everything else you said.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-tradeoffs-weakness" moduleSlug={MODULE_SLUG} title="Tradeoffs, disagreement & weakness">
        <Quiz
          kind="Disagreement"
          question="An interviewer pushes back hard on a decision you described. What's the strongest response?"
          options={[
            {
              label: "Acknowledge their point, restate it to show you heard it, offer your reasoning as a view (not a verdict), and propose a way to test or measure which way is right",
              correct: true,
              explanation:
                "Yes — that's the collaboration-under-tension script. It proves you can disagree without either collapsing or digging in, and resolving via evidence rather than stubbornness is exactly what a good teammate does.",
            },
            {
              label: "Immediately concede that they're right so the conversation stays friendly",
              explanation:
                "Instant collapse reads as having no real conviction. If they make a genuinely better point, update — but reflexively folding on every challenge signals you can't hold a position under mild pressure.",
            },
            {
              label: "Hold your ground firmly and explain why your original answer was correct",
              explanation:
                "Digging in defensively is the other failure mode. The test is whether you can engage with a challenge collaboratively, not whether you can refuse to budge.",
            },
          ]}
        />
        <Quiz
          kind="Weakness"
          question="What makes a good answer to 'what's your greatest weakness'?"
          options={[
            {
              label: "A real, non-disqualifying weakness plus the specific habit or system you use to manage it",
              correct: true,
              explanation:
                "Correct. The weakness is the setup; the management strategy is the payoff. It shows self-awareness plus a concrete system — believable and reassuring at the same time.",
            },
            {
              label: "A strength disguised as a weakness, like 'I'm a perfectionist' or 'I work too hard'",
              explanation:
                "Interviewers have heard the fake-weakness a thousand times and it reads as evasive. It signals you won't be honest about real gaps — the opposite of what the question is probing for.",
            },
            {
              label: "Whatever weakness is least relevant to the job, stated as briefly as possible",
              explanation:
                "Dodging with an irrelevant throwaway misses the point. The answer that lands is a genuine tendency plus how you keep it in check — that's where the self-awareness shows.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 8. QUESTIONS YOU ASK ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The questions YOU ask — your seniority signal</h2>
        <p className="mb-4">
          At the end, they&apos;ll say &quot;do you have any questions for me?&quot; This is not a formality, and &quot;no, I think you
          covered everything&quot; is a small disaster — it tells them you weren&apos;t evaluating <em>them</em>. Your questions
          are where you flip the date around and prove you&apos;re sizing up the team. Prepare three or four that reveal how
          the work actually happens:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>On the work:</strong> &quot;What does the path from idea to production look like for a typical front-end change here?&quot;</li>
          <li><strong>On quality:</strong> &quot;How does the team think about the tradeoff between shipping fast and paying down tech debt?&quot;</li>
          <li><strong>On growth:</strong> &quot;What separates someone who&apos;s doing well in this role from someone who&apos;s exceeding expectations?&quot;</li>
          <li><strong>On reality:</strong> &quot;What&apos;s something about working here that surprised you when you joined?&quot;</li>
          <li><strong>On the interviewer:</strong> &quot;What&apos;s a recent project you were proud of, and what made it work?&quot;</li>
        </ul>
        <p className="mb-4">
          Good questions do double duty: they give you the information you genuinely need to decide whether to take the
          job, <em>and</em> they signal the way you think. Asking about the path-to-production shows you care about
          process and shipping. Asking about the speed-versus-debt tradeoff shows you think in tradeoffs (the exact
          muscle the design module is built on). Asking what surprised them gets you an honest answer instead of the
          recruiting brochure.
        </p>
        <Callout variant="warn" title="Avoid questions you could have Googled — and avoid 'so... do I have it?'">
          <p>
            Don&apos;t ask things the company&apos;s homepage answers (&quot;so what does your product do?&quot;) — it signals you didn&apos;t
            prepare. And don&apos;t fish for a verdict (&quot;how do you think I did?&quot;) — it puts the interviewer on the spot and
            reads as anxious. Ask questions that only an insider could answer and that you&apos;d actually want to know
            before saying yes.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 9. LEVELING / SALARY & RED FLAGS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Leveling &amp; salary (lightly) — and the red flags to avoid</h2>
        <p className="mb-4">
          Compensation and leveling usually live with the recruiter, not the technical interviewer, so you rarely
          negotiate in a behavioral round. But a few principles hold. Try not to throw out the first number — &quot;I&apos;d like
          to understand the role and level better first; what range is budgeted for this position?&quot; is a perfectly
          professional deflection. Anchor on the <em>level</em> (the scope and expectations) before the dollar figure,
          because the level sets the band. And it&apos;s fine to say you&apos;re weighing a few factors — growth, the team, the
          work — not just the offer size. None of this requires you to be a hardball negotiator; it just requires you to
          not blurt a number that caps your own upside.
        </p>
        <p className="mb-4">
          Finally, the behavioral red flags — the things that quietly sink otherwise-strong candidates. Watch for these
          in <em>yourself</em>:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Blaming others.</strong> &quot;My manager was useless, QA was slow, the codebase was a mess.&quot; Even if true, it reads as someone who won&apos;t own outcomes — and who&apos;ll blame the next team too.</li>
          <li><strong>No metrics, no specifics.</strong> &quot;It went really well and everyone was happy&quot; is unfalsifiable. Vague results sound invented; specific ones sound real.</li>
          <li><strong>Rambling.</strong> The four-minute answer with no structure. STAR exists precisely to prevent this — if you feel yourself drifting, jump to the Result.</li>
          <li><strong>All &quot;we&quot;, no &quot;I&quot;.</strong> If the interviewer can&apos;t tell what <em>you</em> did, they can&apos;t hire you for it.</li>
          <li><strong>Trashing a past employer.</strong> Negativity about a previous team makes the interviewer wonder what you&apos;ll say about them. Be honest but gracious.</li>
        </ul>
        <Callout variant="info" title="The mirror test">
          <p>
            Record yourself answering &quot;tell me about a conflict&quot; once and play it back. Count how many times you say
            &quot;we&quot; versus &quot;I&quot;, whether there&apos;s a single number in the Result, and whether anyone in the story comes off as
            the villain. Most red flags are invisible from the inside and obvious on playback — which is exactly why
            rehearsal out loud, not in your head, is the highest-leverage prep you can do.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 10. CLOSING STRONG ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Closing strong — the last 90 seconds matter</h2>
        <p className="mb-4">
          The end of an interview is prime real estate that most candidates waste with a limp &quot;thanks, this was great.&quot;
          You get to leave a final impression — use it. A strong close has three moves, in order:
        </p>
        <pre><code>{`1. SUMMARIZE FIT   "Based on what we discussed, this feels like a strong
                    match — the [specific thing about the role] lines up
                    with [the specific thing you do well]."

2. EXPRESS INTEREST "I'm genuinely excited about this — [the concrete
                    reason, not flattery]. I'd love to be part of it."

3. ASK NEXT STEPS  "What do the next steps look like, and is there
                    anything I can clarify or send over that would help?"`}</code></pre>
        <p className="mb-4">
          Summarizing the fit shows you were synthesizing the whole time, not just answering. Expressing genuine,
          specific interest matters more than people think — teams want to hire someone who <em>wants</em> them, and a
          concrete reason (&quot;I&apos;m excited that you ship to real users weekly&quot;) beats generic enthusiasm every time. And
          asking about next steps is simply professional; it signals you&apos;re organized and that you expect this to move
          forward. Three sentences, thirty seconds, and you walk out memorable for the right reasons.
        </p>
        <Callout variant="insight" title="Specific interest beats flattery">
          <p>
            &quot;This was a great conversation&quot; is filler. &quot;I&apos;m excited that the front-end team owns the whole path to
            production and that you measure before optimizing — that&apos;s how I like to work&quot; is a close that proves you
            listened, that you have taste, and that your interest is real. Tie your closing interest back to something
            specific they actually said.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 11. TIE BACK ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Your technical phases ARE your stories — mine them</h2>
        <p className="mb-4">
          Here&apos;s the payoff of everything you&apos;ve built across this course. You don&apos;t need to invent behavioral stories
          from scratch — the technical work you&apos;ve already done <em>is</em> the story bank. Each phase project is a
          ready-made STAR answer waiting to be framed:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>The data-fetching race condition</strong> you debugged and fixed twice → your &quot;hard bug&quot; and &quot;measurable improvement&quot; story (&quot;wrong-data reports went to zero&quot;).</li>
          <li><strong>The system-design mock</strong> you ran end to end → your &quot;a project I drove&quot; story, and proof you think in tradeoffs.</li>
          <li><strong>A refactor where you chose a library over hand-rolling</strong> → your &quot;tradeoff&quot; answer, complete with the boundary where you&apos;d decide differently.</li>
          <li><strong>Any time a teammate reviewed your code and you changed your approach</strong> → your &quot;disagreement&quot; or &quot;feedback&quot; story.</li>
        </ul>
        <p className="mb-4">
          The behavioral round isn&apos;t a separate skill bolted onto the technical ones — it&apos;s the <em>narration layer</em>
          on top of work you&apos;ve already done. Every hard thing you built or fixed is a story; STAR is just the structure
          you pour it into. Mine your own history before you reach for anything invented.
        </p>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you came from backend, your old war stories transfer wholesale — a database race condition, a hot path you
            profiled and sped up, an on-call incident you led the postmortem on. The themes are identical; only the
            vocabulary changes. Don&apos;t leave those stories on the table just because the role is front-end. A
            cross-discipline debugging story is often <em>more</em> impressive, not less.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-closing" moduleSlug={MODULE_SLUG} title="Their questions & closing strong">
        <Quiz
          kind="Questions to ask"
          question="At the end, the interviewer asks 'any questions for me?'. What's the best move?"
          options={[
            {
              label: "Ask a prepared question only an insider could answer — about the path to production, the speed-vs-debt tradeoff, or what surprised them about working there",
              correct: true,
              explanation:
                "Yes. Good questions do double duty: they get you real information AND signal how you think (process, tradeoffs, honesty). They flip the dynamic so you're evaluating the team too — a clear seniority signal.",
            },
            {
              label: "Say 'no, I think you covered everything' to keep things efficient",
              explanation:
                "This is a small disaster — it signals you weren't evaluating them and aren't genuinely interested. Always have three or four prepared questions ready.",
            },
            {
              label: "Ask how you did and whether you're getting an offer",
              explanation:
                "Fishing for a verdict puts the interviewer on the spot and reads as anxious. Ask things you'd actually want to know before saying yes, not for reassurance about your performance.",
            },
          ]}
        />
        <Quiz
          kind="Closing"
          question="What's the strongest way to close the interview in the final 90 seconds?"
          options={[
            {
              label: "Summarize why it's a fit, express specific genuine interest tied to something they said, and ask about next steps",
              correct: true,
              explanation:
                "Correct. Summarizing shows you were synthesizing; specific interest (not flattery) shows you listened and actually want the role; asking next steps is professional and forward-moving. Three sentences, big impression.",
            },
            {
              label: "Thank them politely and say it was a great conversation, then leave",
              explanation:
                "That's filler and wastes prime real estate. A generic 'great conversation' leaves no impression — tie your interest to something concrete they said instead.",
            },
            {
              label: "List every reason you're the best candidate to make sure they remember you",
              explanation:
                "A hard-sell monologue at the end reads as desperate, not confident. A crisp fit-summary plus specific interest lands far better than relitigating your whole résumé.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 12. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks 'how do you prep for the behavioral round?'">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Structure every story with STAR.</strong> Situation and Task tight; Action is the bulk and in the
              first person; Result quantified plus a lesson. It stops you rambling.
            </li>
            <li>
              <strong>Prepare a small story bank.</strong> Five themes — hard bug, conflict, project I led, a failure,
              a measurable win — recombined to answer almost any prompt.
            </li>
            <li>
              <strong>Name tradeoffs and own outcomes.</strong> Cost, benefit, reason, and where I&apos;d decide
              differently. Own my slice of any bad result plainly — ownership reads as confidence.
            </li>
            <li>
              <strong>Handle disagreement collaboratively.</strong> Acknowledge, restate, offer my view, propose a way
              to test it. Update if they&apos;re right; never make the other person look dumb.
            </li>
            <li>
              <strong>&quot;I don&apos;t know&quot; beats a bluff.</strong> Say what I do know and how I&apos;d find out the rest.
            </li>
            <li>
              <strong>Ask good questions and close strong.</strong> Insider questions that signal how I think, then
              summarize fit, express specific interest, and ask about next steps.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 13. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project — build your behavioral kit on paper</h2>
        <p className="mb-4">
          Prepare STAR answers for the five most common behavioral prompts, script how you&apos;d handle a &quot;you&apos;re wrong&quot;
          moment gracefully, and write the three questions you&apos;ll ask the interviewer that show you think like a senior.
          This is a writing-and-rehearsing exercise — the goal is a kit you can walk into any behavioral round with.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Mine your history for five stories.</strong> One each for: a hard bug, a conflict/disagreement, a
            project you led, a failure you learned from, and a measurable improvement. Pull from your course projects if
            you&apos;re short — the data-fetching race and the system-design mock are ready-made.
          </li>
          <li>
            <strong>Write each one in STAR.</strong> One or two sentences of Situation and Task, a first-person Action
            that&apos;s the bulk of it, and a Result with a number plus a one-line lesson. Read each aloud and time it —
            aim for 90 seconds to two minutes.
          </li>
          <li>
            <strong>Draft your &quot;tell me about yourself.&quot;</strong> The present / past / future arc, tailored to a real
            job posting you&apos;d apply to, ending on why <em>that</em> role. Keep it under 90 seconds.
          </li>
          <li>
            <strong>Script a &quot;you&apos;re wrong&quot; moment.</strong> Pick a technical opinion you hold, then write out the
            acknowledge → restate → engage → converge script for an interviewer pushing back on it. Practice updating
            gracefully if their point is genuinely better.
          </li>
          <li>
            <strong>Write your three questions for them.</strong> One on the work/process, one on quality or tradeoffs,
            one on growth or what surprised them. Make sure each is something only an insider could answer.
          </li>
          <li>
            <strong>Record and review.</strong> Film yourself answering two prompts cold. On playback, run the mirror
            test: count &quot;we&quot; vs &quot;I&quot;, check for a number in each Result, and make sure nobody comes off as the villain.
            Re-record until the red flags are gone.
          </li>
          <li>
            <strong>Stretch — run a full mock with a friend.</strong> Have them ask a curveball prompt you didn&apos;t
            prepare, then push back on one of your answers. Practice mapping the surprise question to a theme on the fly
            and handling the disagreement without collapsing or digging in.
          </li>
        </ol>
        <Callout variant="spring" title="This is the last skill — and the one most people skip">
          <p>
            Candidates pour weeks into LeetCode and zero hours into behavioral prep, then lose the offer in the round
            they didn&apos;t practice. An hour spent writing and rehearsing this kit has a higher return than another hour of
            algorithms, because almost no one does it. You&apos;ve built the technical foundation across nine phases — this
            is how you make sure the room actually hears it.
          </p>
        </Callout>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
