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
  { id: "incident-mechanics", title: "Incident mechanics" },
  { id: "during", title: "Running the incident" },
  { id: "after", title: "After the incident" },
];

const incRoles = `flowchart LR
  IC[Incident Commander] --> Comm[Communications Lead]
  IC --> Ops[Operations Lead]
  IC --> Scribe[Scribe]
  Ops --> SME1[Subject Matter Expert]
  Ops --> SME2[Subject Matter Expert]`;

export default function Page() {
  const mod = getModuleBySlug("on-call-incident")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <ModuleProgress moduleSlug="on-call-incident" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🚨</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          On-call is a craft. There&apos;s a structure that good teams use to keep their heads in an outage, and a set of rituals afterwards that turn an incident into durable improvement. By the end of this module you&apos;ll know the structure, the rituals, and the cultural commitments that make on-call sustainable.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Severity levels and what they trigger — page, ticket, async</li>
          <li>The three roles in a real incident: incident commander, comms lead, operations lead</li>
          <li>Mitigate before you diagnose — and what that actually looks like</li>
          <li>Blameless postmortems: the format, the rules, and why &quot;blameless&quot; doesn&apos;t mean &quot;consequence-free&quot;</li>
          <li>MTTR, MTTD, and the metrics you actually want to drive down</li>
          <li>Sustainable rotations: load shedding, calibrated alert volume, paging during business hours</li>
        </ul>
      </section>

      <Callout variant="info" title="Why this matters">
        <p className="m-0">Incidents are when reliability work gets cashed in. A team with great architecture and bad incident response will still produce long, painful outages; a team with mediocre architecture and great incident response will recover fast every time. The skill of running an incident is shockingly transferable — the structure is the same whether the page is &quot;database on fire&quot; or &quot;CDN config bug.&quot;</p>
      </Callout>

      {/* PART 1 — Mechanics */}
      <Checkpoint moduleSlug="on-call-incident" id="incident-mechanics" title="Incident mechanics" xp={20} celebration="Sevs and roles — clear in your head. You can show up to your first incident and know what to do.">
      <section>
        <h2>Part 1: Severity, paging, and roles</h2>

        <h3>Severity levels</h3>

        <p>
          Most companies use some variant of SEV1 / SEV2 / SEV3 (and sometimes SEV4 for tracking-only). The numbers matter less than what each one <em>triggers</em>:
        </p>
        <ul>
          <li><strong>SEV1 — major customer impact.</strong> The product is down or seriously degraded for many users. Pages on-call immediately. Wakes people up at 3am. Triggers customer comms within 30 minutes.</li>
          <li><strong>SEV2 — significant impact.</strong> A meaningful subset of users affected, or a key feature degraded. Pages during business hours, may not page overnight. Customer comms if outage is visible.</li>
          <li><strong>SEV3 — minor impact.</strong> Internal degradation or small visible issue. Filed as a ticket, worked next business day. Not a page.</li>
          <li><strong>SEV4 — informational / latent.</strong> Tracking only — &quot;we noticed this; we should fix it; not urgent.&quot;</li>
        </ul>
        <p>
          The two most useful properties of a severity scheme: it&apos;s applied consistently (so SEV2 means the same thing across teams) and the response is calibrated to it (SEV1 actually wakes people up; SEV3 actually doesn&apos;t). Get either wrong and severity becomes meaningless theater.
        </p>

        <Callout variant="warn" title="Severity inflation">
          <p className="m-0">If every customer-impacting issue gets called a SEV1, you&apos;ve devalued the term and your on-call rotation is now fielding 5 SEV1s a week. The fix is calibration: SEV1 should be rare (one a month or less for a healthy team). Anything more frequent is either inflated severity, real reliability debt, or both. Reviewing severity-classification post-hoc — &quot;was this really a SEV1?&quot; — is one of the better hygiene practices on a mature team.</p>
        </Callout>

        <h3>Paging vs ticketing vs async</h3>

        <p>
          Page = wake someone up now. Ticket = file work that gets prioritized in normal flow. Async = post in a channel, gets eyeballs eventually but no commitment. Three different urgencies, three different costs. The mistake teams make is treating these as the same channel — pages get ignored when they&apos;re used for SEV3 stuff, and tickets get lost when they&apos;re used for SEV1 stuff.
        </p>

        <h3>The three roles in an incident</h3>

        <Mermaid chart={incRoles} />

        <ul>
          <li><strong>Incident Commander (IC).</strong> Owns the incident. Coordinates the response. Does not fix things personally. Their job is to keep the team focused, declare next steps, manage scope, and decide when to escalate. The IC is the &quot;single throat to choke&quot; — one person to whom updates flow and from whom decisions come.</li>
          <li><strong>Communications Lead.</strong> Owns external messaging — status page updates, customer comms, exec notifications. The IC and Ops Lead are heads-down on the problem; the Comms Lead translates &quot;we know what&apos;s happening&quot; into &quot;customers know what to expect.&quot;</li>
          <li><strong>Operations Lead.</strong> Drives the technical fix. Coordinates SMEs, runs the diagnose-and-mitigate loop, owns the deploy / rollback / config change. On small incidents the IC and Ops Lead can be the same person; on large ones, never.</li>
          <li><strong>Scribe (optional but valuable).</strong> Keeps a running timeline of what happened, what was tried, what worked. Saves the post-mortem from depending on memory.</li>
          <li><strong>SMEs.</strong> Subject matter experts pulled in by the Ops Lead. They have deep knowledge of one piece of the system. They do not run the incident; they do specific deep-dives at the Ops Lead&apos;s direction.</li>
        </ul>

        <Callout variant="insight" title={`The IC's superpower is saying "not now"`}>
          <p className="m-0">During an incident, well-intentioned people will stream into the channel with theories, suggestions, and questions. Most of them are noise. The IC&apos;s job is to triage incoming signal: useful theory → route to Ops Lead; customer impact question → route to Comms Lead; everything else → &quot;we&apos;ll come back to this in the post-mortem.&quot; Without an IC, you get a 30-person Zoom call where everyone talks at once and nothing happens. With an IC, you get a coordinated response with a clear flow of decisions.</p>
        </Callout>

        <h3>The first 5 minutes</h3>

        <p>
          A page fires. Here&apos;s the standard opening:
        </p>
        <ol>
          <li><strong>Acknowledge the page.</strong> Within ~5 minutes. Tells the system &quot;a human is on it&quot; — and stops the escalation timer.</li>
          <li><strong>Open the incident channel.</strong> A dedicated Slack channel (or whatever your tool is). All discussion goes there; no DMs, no other channels.</li>
          <li><strong>Read the runbook.</strong> The alert linked one (we covered this in observability). Even if you wrote it. Read it again — you&apos;re bleary, you&apos;ll miss things you wrote yesterday.</li>
          <li><strong>Confirm scope.</strong> Is this affecting one customer, one region, one feature, or everyone? This number drives whether you escalate to a SEV1.</li>
          <li><strong>Declare an incident if needed.</strong> If the issue is bigger than &quot;I can fix this in 5 minutes by myself,&quot; declare an incident, page the IC and Comms Lead, and start the formal response.</li>
        </ol>

        <Quiz
          kind="Quick check"
          question="In a SEV1 outage with 30 people on a Zoom call, what is the Incident Commander's primary job?"
          options={[
            { label: "Diagnose and fix the problem.", explanation: "That's the Ops Lead's job. The IC who tries to fix things personally loses the ability to coordinate, and the response gets muddled." },
            { label: "Coordinate the response: triage incoming theories, assign work to SMEs, manage scope, decide when to escalate, and keep the team focused on mitigation. The IC explicitly does not fix things — that's the Ops Lead.", correct: true, explanation: "Right. The split between 'fix the thing' and 'coordinate the response' is the single most important structural choice in incident management. One person doing both poorly is much worse than two people doing each half competently. ICs need their hands free to think; Ops Leads need permission to dig deep without managing the room." },
            { label: "Write the post-mortem.", explanation: "That happens after the incident is resolved, and is usually owned by the Ops Lead or a designated post-mortem author. The IC's role is during the incident." },
            { label: "Decide whether to escalate to leadership.", explanation: "Yes, that's part of the IC's job — but it's a small piece of the larger coordination role, not the primary task." },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="Your team is suffering from severity inflation: every customer-visible bug gets labeled SEV1. The on-call rotation is exhausted. What's the right intervention?"
          options={[
            { label: "Add more SEVs (SEV0, SEV1.5) for finer granularity.", explanation: "More categories don't fix calibration — they just add new categories to misuse. The fix is recalibration of existing ones." },
            { label: "Define explicit, measurable criteria for each SEV ('SEV1 = >5% of users affected OR revenue impact > $X/hour OR core auth/payment broken'), apply them consistently, and review past incidents to recalibrate. Most companies' SEV1 should fire less than once a month.", correct: true, explanation: "Right. Severity inflation is fixed by tightening the definitions and applying them consistently — including post-hoc review where last quarter's 'SEV1s' get re-classified. Yes, individual teams will push back ('our issue feels like a SEV1!') but the cost of inflated severity is real: alert fatigue, diluted response priority, exhausted humans. Calibration is a culture project, not a documentation project — leadership has to back the recalibration." },
            { label: "Just do whatever the engineer who paged feels is right — they know best.", explanation: "That's exactly what produces inflation. Severity is a system-level signal that has to be applied consistently for the system to work." },
            { label: "Eliminate severity levels.", explanation: "Removing the system means everything is the same urgency, which means nothing is. Calibration solves the problem; abandoning the system makes it worse." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Severity, paging, and roles are the structural scaffolding. Everything else is what you do inside that structure."
          points={[
            { takeaway: "Severity is calibrated by what it triggers, not by feelings.", detail: <>SEV1 wakes people up; SEV3 doesn&apos;t. The job is keeping the categories meaningfully separate, with explicit criteria.</> },
            { takeaway: "Page, ticket, async — three urgencies, three channels. Don't mix them.", detail: <>Pages used for non-urgent work make pages ignored. Tickets used for urgent work mean it gets lost.</> },
            { takeaway: "IC, Ops Lead, Comms Lead are different roles — one person should not do all three.", detail: <>The IC coordinates; the Ops Lead fixes; the Comms Lead communicates externally. On small incidents, IC and Ops can merge — but the comms work must always be a separate head.</> },
            { takeaway: "First 5 minutes: ack, open the channel, read the runbook, confirm scope, declare if needed.", detail: <>The opening is procedural for a reason — your judgment under stress is degraded; the procedure carries you through.</> },
            { takeaway: "Severity inflation is a culture problem with a culture solution.", detail: <>Tighten definitions, apply consistently, review post-hoc, and have leadership back the recalibration.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 2 — During */}
      <Checkpoint moduleSlug="on-call-incident" id="during" title="Running the incident" xp={25} celebration="Mitigate-before-diagnose burned in. The IC playbook is yours.">
      <section>
        <h2>Part 2: Inside the incident</h2>

        <h3>Mitigate before you diagnose</h3>

        <p>
          The single highest-leverage rule in incident response: <strong>stop the bleeding before you understand it.</strong> If you know how to make the symptom go away, do that, even if you don&apos;t yet know why the symptom appeared. Restore service first; debug second. The customer is suffering during diagnosis; the customer is not suffering during a clean rollback.
        </p>

        <p>
          The classic mitigations, in rough order of preference:
        </p>
        <ol>
          <li><strong>Roll back the deploy.</strong> If the incident started after a deploy, roll back. If it might have started after a deploy, roll back. Diagnosis later. Rolling back a healthy deploy is cheap; investigating an incident in progress is expensive.</li>
          <li><strong>Revert the config change.</strong> Same logic for config flags. Many outages are configuration changes, not code changes — and reverting a config flag is faster than rolling back a deploy.</li>
          <li><strong>Failover.</strong> Switch to the standby region, the standby database, the standby cache. Most fleets have failover capability; most teams don&apos;t exercise it; most teams therefore don&apos;t trust it during an incident. Practicing failover during calm times is upstream of using it in real outages.</li>
          <li><strong>Shed load.</strong> Turn down rate limits, drop low-priority traffic, disable non-essential features. Buys time at the cost of partial service.</li>
          <li><strong>Scale up.</strong> Add capacity. Slow (autoscaling has a multi-minute lag) but sometimes the only option for a saturation incident.</li>
        </ol>

        <Callout variant="warn" title="The investigation trap">
          <p className="m-0">An engineer mid-outage gets curious: &quot;wait, why is this happening though?&quot; They start digging into the root cause while the customer is still suffering. The IC&apos;s job is to interrupt: &quot;great question — first, can we mitigate? Then we can investigate.&quot; The instinct to understand is engineering culture; in an incident, it costs customer-minutes. Investigate after mitigation has been deployed (and ideally proven to work).</p>
        </Callout>

        <h3>Communicate frequently, even when you have nothing new</h3>

        <p>
          During an incident, customers and stakeholders go from anxious to angry surprisingly fast when communication stops. The Comms Lead should post updates on a schedule — every 15-30 minutes during a SEV1 — even if the update is &quot;still investigating, no new info.&quot; Silence is interpreted as &quot;they don&apos;t care&quot; or &quot;it&apos;s worse than they&apos;re saying.&quot; A regular drumbeat of &quot;we know, we&apos;re on it&quot; buys enormous goodwill.
        </p>

        <p>
          Externally, status pages are the standard. Internally, a dedicated Slack channel with a pinned summary that gets updated. Both should follow the same template: what&apos;s impacted, what we know, what we&apos;re doing, when the next update will be. &quot;Next update at 14:30&quot; is itself a useful piece of information — people stop refreshing every 2 minutes.
        </p>

        <h3>Time-box experiments</h3>

        <p>
          The Ops Lead is going to try things. Each thing should have a time box: &quot;I&apos;m going to try X. I&apos;ll know in 10 minutes if it worked. If it doesn&apos;t, I&apos;ll try Y.&quot; Without time-boxing, an engineer can spend 90 minutes on a hypothesis that turned out to be wrong while the IC waits politely. The IC should pull this out: &quot;how long until you know if this is the right path?&quot;
        </p>

        <h3>Escalate early, escalate often</h3>

        <p>
          The cost of escalating someone who didn&apos;t need to be is one mildly-annoyed teammate. The cost of <em>not</em> escalating someone who did need to be is a longer outage. Escalate at the slightest doubt. The expert who got pulled in to find &quot;oh, you already had this&quot; is fine; the IC who doesn&apos;t pull them in and discovers 30 minutes later they were the one who could&apos;ve fixed it in 2 minutes is not.
        </p>

        <ClassifyChallenge
          title="What action fits the situation?"
          prompt="Each scenario is happening live. What's the right immediate move?"
          buckets={[
            { id: "rollback", label: "Roll back / revert", color: "rose" },
            { id: "failover", label: "Failover", color: "amber" },
            { id: "shed", label: "Shed load", color: "indigo" },
            { id: "scale", label: "Scale up", color: "emerald" },
          ]}
          items={[
            { id: "s1", label: "p99 latency tripled within 30 seconds of the 14:00 deploy completing", answer: "rollback", explanation: "Time correlation with a deploy = roll back first, ask questions later. The cheapest mitigation when a recent change is suspect." },
            { id: "s2", label: "Primary database is unreachable; replica in another zone is healthy", answer: "failover", explanation: "Standby exists, primary is broken — that's exactly what failover is for. Practice it in calm times so you trust it in incidents." },
            { id: "s3", label: "Traffic spike from a viral marketing tweet, all backends saturated, no recent change", answer: "scale", explanation: "It's a capacity problem, not a bug. Scale up; consider rate-limiting non-essential traffic to buy time while autoscaling catches up." },
            { id: "s4", label: "Search service is down; user-facing impact is poor search results, but core flows still work. We need ~30 minutes to fix.", answer: "shed", explanation: "Disable the search dropdown / show 'search temporarily unavailable' banner. Keeps core flows working while the team fixes search. Partial service > none." },
            { id: "s5", label: "A feature flag rollout to 100% started an hour ago, error rate climbed slowly since", answer: "rollback", explanation: "Revert the flag — that's the same playbook as 'roll back the deploy,' just for config. Faster than a deploy rollback, often the right first move." },
            { id: "s6", label: "One AZ is degraded across multiple AWS services, our primary region is partially affected", answer: "failover", explanation: "AZ-level issue, fail over to another zone or region. This is exactly why multi-AZ deploys exist — practice failover so you trust it." },
          ]}
        />

        <Quiz
          kind="Drill"
          question="During an incident, an engineer says: 'I think I know what's happening — give me 30 minutes to dig into the database logs to confirm.' What's the right Incident Commander response?"
          options={[
            { label: "Approved — let them investigate, that's how we'll know what's really going on.", explanation: "Investigation while the customer is suffering is the wrong tradeoff. The IC's first question must be 'can we mitigate now while you investigate?'" },
            { label: "'Great — meanwhile, what mitigation are we deploying right now? Is there a rollback we can run while you investigate?' Mitigate in parallel with investigation, never serial.", correct: true, explanation: "Right. The IC's job is to keep mitigation moving while investigation happens. The two should run in parallel, with mitigation getting priority on shared resources. If a rollback is available, run it now — even if the engineer is right that this is database-related, the rollback might bypass the issue and stop the bleeding while they finish investigating. Investigation that delays mitigation is a customer-cost the IC has to interrupt." },
            { label: "Cancel the investigation and roll back without diagnosis.", explanation: "Rollback should be considered, but you don't need to silence the engineer to do that — they can investigate AFTER the rollback is in flight." },
            { label: "Wait — they might be right.", explanation: "They might be right and the customer is still suffering. Mitigation comes first, regardless of who has theories." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="A SEV1 has been ongoing for 45 minutes with no public update yet. What's the cost of staying silent?"
          options={[
            { label: "No cost — best to wait until we have an answer.", explanation: "Silence is the default-bad communication choice. Anxious customers go from worried to angry, and your support team gets buried in tickets that wouldn't have existed with regular updates." },
            { label: "Customer trust erodes quickly. Anxious users assume the worst, support tickets pile up, and exec stakeholders find out from Twitter instead of from you. Even a 'we know, we're on it, next update at HH:MM' post buys enormous goodwill — and most of the cost is two minutes of typing.", correct: true, explanation: "Right. The Comms Lead exists precisely so that the people fixing the problem don't have to think about messaging — but communication still has to happen. A regular update cadence (every 15-30 minutes during a SEV1) is the standard. The content can be 'no new info' as long as the timing is reliable. Silence is interpreted as either 'they don't know' or 'they're hiding something' — both bad." },
            { label: "Public updates make the situation look worse.", explanation: "Empirically false — customers consistently report that regular updates during incidents increase trust. Silence reduces it." },
            { label: "Status pages are out of fashion.", explanation: "Status pages are the standard for a reason — they're how customers self-serve answers without DDoSing your support team during an outage." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="The hardest skill is mitigating before you understand — and it's the highest-leverage one."
          points={[
            { takeaway: "Mitigate before you diagnose. Always.", detail: <>Stop the bleeding first. The customer is suffering during diagnosis but not during a clean rollback. Investigate after mitigation lands.</> },
            { takeaway: "The mitigation hierarchy: rollback, revert, failover, shed, scale.", detail: <>Roughly in order of speed and reliability. The first three are surgical; the last two buy time.</> },
            { takeaway: "Communicate on a cadence, even with nothing new.", detail: <>&quot;Next update at HH:MM&quot; is itself useful information. Silence is the worst communication choice.</> },
            { takeaway: "Time-box every experiment.", detail: <>&quot;I&apos;ll know in 10 minutes&quot; lets the IC keep the response moving. Untimed investigations consume customer-minutes invisibly.</> },
            { takeaway: "Escalate early. The cost of an unneeded escalation is small; the cost of a missing one is large.", detail: <>Pulling someone in who turned out to already-know is fine. Not pulling them in and finding out 30 minutes later they would&apos;ve fixed it in 2 is the bad outcome.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 3 — After */}
      <Checkpoint moduleSlug="on-call-incident" id="after" title="After the incident" xp={25} celebration="Postmortems, action items, and a sustainable rotation. The full lifecycle is yours.">
      <section>
        <h2>Part 3: After the incident — postmortems and rotation health</h2>

        <h3>The blameless postmortem</h3>

        <p>
          Within 1-5 days of a SEV1 or SEV2, the team writes a postmortem (sometimes called a &quot;learnings&quot; or &quot;incident review&quot; doc). The format is roughly:
        </p>
        <ul>
          <li><strong>Summary.</strong> One paragraph: what happened, who was affected, how long.</li>
          <li><strong>Timeline.</strong> Bullet points with timestamps. What happened, what was tried, what worked. Mostly assembled from the incident channel by the scribe.</li>
          <li><strong>Root cause(s).</strong> The actual reason this happened. Often plural — &quot;the bug shipped because the test suite didn&apos;t cover this case, and it stayed broken in production for 3 hours because the alert didn&apos;t fire because the metric was named wrong.&quot;</li>
          <li><strong>What went well.</strong> Genuinely include this. Detection was fast? Failover worked? The right person was paged? Note it. Without &quot;what went well,&quot; postmortems become demoralizing rituals of failure.</li>
          <li><strong>What didn&apos;t go well.</strong> Honest list, no blame.</li>
          <li><strong>Action items.</strong> Specific, owned, dated. Not &quot;improve testing&quot; — &quot;add integration test for the X scenario, owner: Aria, due: Friday.&quot;</li>
        </ul>

        <Callout variant="insight" title={`"Blameless" doesn't mean "consequence-free"`}>
          <p className="m-0">A common confusion: blameless postmortems don&apos;t mean nothing changes. They mean the postmortem itself doesn&apos;t blame an individual — because doing so makes future engineers afraid to reveal what happened, which destroys the learning. But the action items absolutely have consequences: you will add tests, you will improve runbooks, you will change deploy gates. The cultural commitment is &quot;we treat the incident as a system failure, not a person failure&quot; — and the system always has owners. If the same person triggers a similar incident three times, that&apos;s a separate management conversation, not a postmortem topic.</p>
        </Callout>

        <h3>The five whys (used carefully)</h3>

        <p>
          The five-whys technique walks back from the symptom to the root cause by asking &quot;why&quot; five times. &quot;Why did the service 5xx? — DB connection pool exhausted. Why was the pool exhausted? — Slow downstream call held connections. Why was the downstream slow? — Cache eviction storm. Why was there a storm? — Cache TTL synchronized across keys. Why was that? — Default TTL config we never overrode.&quot;
        </p>
        <p>
          Used well, this is a powerful technique. Used badly, it&apos;s a way to push past the real systemic issue and land on a single tidy &quot;root cause&quot; that&apos;s both convenient and incomplete. Real incidents usually have multiple contributing factors at multiple layers — feature flag rollout AND test gap AND alert misnamed AND runbook outdated. A good postmortem captures all of them.
        </p>

        <h3>Action items that actually ship</h3>

        <p>
          The most common postmortem failure mode is the action items list that nobody touches. Three tactics that help:
        </p>
        <ul>
          <li><strong>Make them specific.</strong> &quot;Add monitoring on X&quot; is a wish; &quot;Add a Prometheus alert that fires when downstream Y returns 5xx for &gt;2 minutes, owned by Aria, due Friday&quot; is a ticket.</li>
          <li><strong>Cap the count.</strong> 5-10 action items per postmortem, max. A list of 30 means nothing will get done. Pick the highest-leverage ones; let the rest live in the backlog.</li>
          <li><strong>Track to completion.</strong> A weekly or biweekly review of open postmortem actions. If something keeps slipping, escalate or kill it explicitly. Slipping silently is the failure mode.</li>
        </ul>

        <h3>Reliability metrics worth tracking</h3>

        <ul>
          <li><strong>MTTD — Mean Time To Detect.</strong> From incident start to alert firing. Improving this means better signals (covered in Module 21).</li>
          <li><strong>MTTR — Mean Time To Recover.</strong> From alert to service restored. Most of this is the time spent diagnosing and mitigating; runbooks, practiced failover, and good incident process all reduce it.</li>
          <li><strong>MTBF — Mean Time Between Failures.</strong> How long between SEV1s. Driven by deeper architecture and process changes.</li>
          <li><strong>Incidents per quarter / pages per week.</strong> Volume metrics. A team trending up on pages-per-week is heading toward burnout regardless of MTTR.</li>
        </ul>

        <h3>Sustainable on-call rotation</h3>

        <p>
          The point of all the previous structure is to make on-call sustainable for humans. A rotation that is destroying its members has gone wrong somewhere upstream — usually too many alerts, too many incidents, or too few people on rotation. The signs:
        </p>
        <ul>
          <li>People dread their on-call weeks</li>
          <li>Pages happen on most nights of an on-call shift</li>
          <li>The same on-call engineer has been paged 4 weeks in a row</li>
          <li>Multiple people have asked to leave the rotation</li>
        </ul>
        <p>
          The fixes are upstream of any individual: tighten alerts (Module 21), invest in reliability (less to break), grow the rotation (more people = less individual load), and treat alert fatigue as a team-level emergency, not a personal stamina problem. A 6-person rotation paged twice a week is sustainable; a 3-person rotation paged twice a night is not.
        </p>

        <Callout variant="warn" title="Compensate for follow-the-sun, hand off cleanly">
          <p className="m-0">For incidents that span hours, the on-call who started doesn&apos;t finish. There has to be a clear handoff: outgoing on-call writes a brief in the channel — &quot;here&apos;s what we know, here&apos;s what we tried, here&apos;s what to try next, here are the open threads.&quot; Incoming on-call confirms they&apos;ve read it. Without this, the second on-call re-runs the same diagnosis the first one did, and the customer gets an extra hour of outage. The handoff is a 5-minute process that saves an hour of work.</p>
        </Callout>

        <Quiz
          kind="Drill"
          question="A junior engineer pushed a config change that triggered an outage. The team's instinct is to write the postmortem with 'Engineer X pushed bad config' as the root cause. Why is that bad, and what's a better framing?"
          options={[
            { label: "Nothing's wrong with naming the engineer — they did push the change.", explanation: "Naming the individual is the failure. The system that allowed a junior engineer to ship a change of that blast radius without review or canary is what failed. The engineer is one of many people who could have made the same mistake." },
            { label: "Blame disincentivizes future engineers from being honest about what happened, which destroys the learning. The better framing is system-level: 'a config change was deployed without canary, the impact wasn't caught by automation, the rollback took longer than necessary because the rollback runbook was out of date.' Action items target the system: require canary on all config changes, add validation, update the rollback runbook.", correct: true, explanation: "Right. Blameless postmortems aren't about being nice — they're about getting the actual learnings out of an incident. If engineers fear being named, they'll obscure what actually happened, and the team will keep tripping on the same gaps. Frame everything as system failures and what guardrails would have caught the issue. The engineer who pushed the change is a participant in the postmortem, not the subject of it." },
            { label: "Just don't write a postmortem to avoid the conflict.", explanation: "Skipping the postmortem means the same incident will recur. The fix is the framing, not the avoidance." },
            { label: "Privately blame the engineer; publicly write something else.", explanation: "That's worse than open blame — it teaches the team to read between the lines and erodes trust on top of everything else." },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="Your team's MTTR has been climbing for two quarters even though incident count is steady. What does this suggest, and what would you investigate first?"
          options={[
            { label: "Probably nothing — MTTR varies naturally.", explanation: "Trending in one direction over six months is unlikely to be noise. There's almost certainly a systemic shift." },
            { label: "Something is making each incident harder to fix. Likely culprits: runbooks have decayed (instructions are out of date), key knowledge has left the team, the on-call rotation has new people who don't yet know the system, observability has degraded (traces/dashboards don't cover the new architecture), or the system has accreted complexity that incidents now have to navigate. Start by reading the last 5 postmortems and seeing what the time-to-mitigate breakdown looks like.", correct: true, explanation: "Right. MTTR is an output metric — it's a result of many things: detection speed, runbook quality, on-call experience, observability fidelity, system complexity. Steady incident count + climbing MTTR almost always points to one of: knowledge erosion (people leaving, docs decaying), observability decay (tools that worked for last year's architecture), or growing complexity (incidents now span more services). The diagnostic is to break down recent postmortems and see where the time is going — detect, diagnose, mitigate — and which phase has grown." },
            { label: "Hire more on-call engineers.", explanation: "More people doesn't fix runbooks, observability, or system complexity. It might help with rotation health but won't bring MTTR down on its own." },
            { label: "Lower the SLO so MTTR matters less.", explanation: "That's hiding the trend, not fixing it. The SLO exists to protect the user; loosening it doesn't help anyone." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="The work after the incident is what compounds. Without postmortems and follow-through, every incident is just suffering."
          points={[
            { takeaway: "Blameless postmortems get the learnings out of incidents.", detail: <>Frame failures as system failures, not person failures. Anyone could have made the same mistake; the question is what would have caught it.</> },
            { takeaway: "Action items: specific, owned, dated, capped, tracked.", detail: <>&quot;Improve testing&quot; is a wish. &quot;Add integration test for X, owner: Aria, due Friday&quot; is a ticket. Cap at 5-10; track to completion.</> },
            { takeaway: "Track MTTD, MTTR, and pages-per-week.", detail: <>Output metrics that show whether the team&apos;s reliability work is paying off. Volume metrics show whether the team is sustainable.</> },
            { takeaway: "Hand off cleanly during long incidents.", detail: <>Outgoing on-call writes &quot;what we know, what we tried, what to try next.&quot; Incoming confirms they&apos;ve read it. 5 minutes spent here saves an hour.</> },
            { takeaway: "Alert fatigue is a team-level emergency.", detail: <>Treat it that way: tighten alerts, invest in reliability, grow the rotation. Stamina is not a substitute for systemic fixes.</> },
          ]}
        />
      </section>
      </Checkpoint>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Phase 4 complete</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          That&apos;s the reliability and operations toolkit: load balancing, rate limiting, Resilience4j, idempotency, observability, and incident response. You can now design systems that hold up under real production stress — and operate them with humans who don&apos;t hate their jobs. Phase 5 takes us into the deeper distributed systems territory: clocks, consensus, replication, and partitioning.
        </p>
        <Link
          href="/courses/system-design"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-sky-600 hover:to-blue-600 transition no-underline"
        >
          ← Back to all modules
        </Link>
      </section>
    </article>
  );
}
