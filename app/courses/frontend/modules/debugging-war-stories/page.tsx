import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "debugging-war-stories";

const CHECKPOINTS = [
  { id: "cp-structure", title: "The five-beat structure" },
  { id: "cp-classic-bugs", title: "The course's classic bugs" },
  { id: "cp-telling-it", title: "Telling it well" },
];

export default function DebuggingWarStoriesModule() {
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
          Debugging stories, how to talk about a bug you fixed
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          &quot;Tell me about a hard bug you fixed.&quot; It sounds casual. It&apos;s actually one of the most revealing questions
          in the loop, it shows how you think when the code is lying to you. The good news: you&apos;ve already debugged
          four classic bugs in this course. Let&apos;s turn them into stories you can tell in two minutes flat.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. WHY THEY ASK ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Why interviewers ask for a hard bug</h2>
        <p className="mb-4">
          Anyone can recite that <code>useEffect</code> runs after render. The debugging question probes something you
          can&apos;t memorize: <strong>your problem-solving process under uncertainty.</strong> When production is broken and
          the stack trace points nowhere useful, what do you actually do?
        </p>
        <p className="mb-4">A great answer demonstrates four things at once:</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>You form hypotheses</strong> instead of changing things at random until the symptom moves.</li>
          <li><strong>You reason about root cause</strong>, not just the symptom, you fix the disease, not the fever.</li>
          <li><strong>You think about prevention</strong>, a senior engineer asks &quot;how do we make this class of bug impossible?&quot;</li>
          <li><strong>You can communicate technical detail clearly</strong> to someone who wasn&apos;t there.</li>
        </ul>
        <Callout variant="warn" title="The answer that fails">
          <p>
            &quot;Yeah, there was this weird bug, I poked at it for a while, eventually I changed something and it worked.&quot;
            No hypothesis, no root cause, no prevention. It signals that you fix bugs by luck. Even a genuinely hard bug
            sounds junior if you tell it as a random walk.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. THE STRUCTURE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The five-beat structure of a great bug story</h2>
        <p className="mb-4">
          Every memorable debugging story follows the same arc. It&apos;s STAR adapted for debugging, and once you have the
          beats, any bug slots into them.
        </p>
        <pre><code>{`1. SYMPTOM        what the user/system saw — concrete, specific
2. INVESTIGATION  the hypotheses you formed and how you tested them
3. ROOT CAUSE     the actual mechanism — the "aha"
4. FIX            what you changed and why it addressed the cause
5. PREVENTION     how you stopped the whole class of bug from recurring`}</code></pre>
        <p className="mb-4">
          The two beats people skip are <strong>investigation</strong> and <strong>prevention</strong>, and they&apos;re the
          two that matter most. Investigation is where you show <em>how</em> you think; prevention is where you show you
          think like a senior. The fix itself is often a one-liner; don&apos;t let it be the whole story.
        </p>
        <Callout variant="insight" title="Spend your time in the middle">
          <p>
            A weak telling rushes to the fix: &quot;and then I added a cleanup function.&quot; A strong telling lingers in
            investigation: &quot;I noticed it only happened when typing fast, so I hypothesized response ordering, added
            logging to timestamp each response, and confirmed the older request was resolving last.&quot; The investigation
            <em> is</em> the answer, the fix is just the punchline.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. BUG 1: CLOSURE IN A LOOP ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Story 1, the <code>var</code> closure in a loop</h2>
        <p className="mb-4">
          The oldest classic in the book, and a perfect two-minute story because the root cause is so clean.
        </p>
        <pre><code>{`// SYMPTOM: every button alerts "3", not 0, 1, 2
for (var i = 0; i < 3; i++) {
  buttons[i].onclick = function () {
    alert(i); // always 3
  };
}`}</code></pre>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Symptom:</strong> &quot;Three buttons, each should alert its own index. They all alert 3.&quot;</li>
          <li><strong>Investigation:</strong> &quot;I confirmed the handlers were attached correctly and the indices were right at attach time. The value was only wrong <em>at click time</em>, which pointed at <em>when</em> the variable was read, not how it was set.&quot;</li>
          <li><strong>Root cause:</strong> &quot;<code>var</code> is function-scoped, so all three closures share <em>one</em> <code>i</code>. By the time any click fires, the loop has finished and that single <code>i</code> is 3. The closures captured the variable, not its value.&quot;</li>
          <li><strong>Fix:</strong> &quot;Change <code>var</code> to <code>let</code>. <code>let</code> is block-scoped, so each iteration gets a fresh binding and each closure captures its own <code>i</code>.&quot;</li>
          <li><strong>Prevention:</strong> &quot;Default to <code>let</code>/<code>const</code> everywhere and enable <code>no-var</code> in ESLint so the dangerous pattern can&apos;t come back.&quot;</li>
        </ul>
        <Callout variant="info" title="Why this story plays well">
          <p>
            It tests a deep JS concept (closures capture variables, not values) but resolves in one line. You sound
            knowledgeable without rambling, and the prevention step (a lint rule) shows systemic thinking. It&apos;s a great
            warm-up answer if they ask for &quot;a bug, doesn&apos;t have to be huge.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 4. BUG 2: STALE CLOSURE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Story 2, the stale closure in <code>useEffect</code></h2>
        <p className="mb-4">
          The React-flavored sibling of the loop bug, and the one interviewers love because it requires the hooks mental
          model.
        </p>
        <pre><code>{`// SYMPTOM: counter shows 1 forever, even after several seconds
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // count is frozen at 0 here
    }, 1000);
    return () => clearInterval(id);
  }, []); // empty deps — effect runs once
  return <p>{count}</p>;
}`}</code></pre>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Symptom:</strong> &quot;A timer that should count up just bounces to 1 and sticks.&quot;</li>
          <li><strong>Investigation:</strong> &quot;The interval was clearly firing, I logged inside it. But it always logged the same <code>count</code>. That told me the problem wasn&apos;t the timer; it was the value the callback could see.&quot;</li>
          <li><strong>Root cause:</strong> &quot;The effect runs once (empty deps), so the interval callback closes over <code>count</code> from the <em>first</em> render, where it&apos;s 0. Every tick computes <code>0 + 1</code>. It&apos;s a stale closure, the callback captured a snapshot of state that never updates.&quot;</li>
          <li><strong>Fix:</strong> &quot;Use the functional updater: <code>setCount(c =&gt; c + 1)</code>. Now it doesn&apos;t depend on the captured <code>count</code> at all, React hands it the latest value.&quot;</li>
          <li><strong>Prevention:</strong> &quot;Trust the <code>react-hooks/exhaustive-deps</code> lint rule, and reach for the functional updater whenever the new state derives from the old one.&quot;</li>
        </ul>
        <Callout variant="insight" title="The sentence that nails it">
          <p>
            &quot;The dependency array is a closure-capture boundary. With <code>[]</code>, the effect captures the first
            render&apos;s state forever. The functional updater sidesteps the capture entirely because it asks React for the
            current value instead of reading a stale one.&quot; That&apos;s the whole hooks model in two sentences.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-structure" moduleSlug={MODULE_SLUG} title="The five-beat structure">
        <Quiz
          kind="Story structure"
          question="Which two beats of a debugging story do candidates most often skip, and which matter most?"
          options={[
            {
              label: "Investigation and prevention, investigation shows HOW you think, prevention shows you think like a senior",
              correct: true,
              explanation:
                "Exactly. The fix is often a one-liner; the value is in the hypothesis-driven investigation and in stopping the whole class of bug from recurring.",
            },
            {
              label: "Symptom and fix, those are the only parts that prove the bug was real",
              correct: false,
              explanation:
                "Symptom and fix are the easy beats people always include. Skipping them isn't the problem; rushing past investigation and prevention is.",
            },
            {
              label: "Root cause and fix, interviewers only care about the final solution",
              correct: false,
              explanation:
                "Interviewers care most about process, not just the solution. A correct fix with no investigation story reads as luck.",
            },
          ]}
        />
        <Quiz
          kind="Anti-pattern"
          question="Why does 'I poked at it for a while and eventually it worked' fail as an answer?"
          options={[
            {
              label: "It shows no hypothesis, no root cause, and no prevention, it signals you fix bugs by luck",
              correct: true,
              explanation:
                "Right. Even a genuinely hard bug sounds junior when told as a random walk. The structure is what converts a war story into evidence of skill.",
            },
            {
              label: "It's too short to fill the time allotted",
              correct: false,
              explanation:
                "Length isn't the issue, a tight two-minute story is ideal. The problem is the absence of structured reasoning, not brevity.",
            },
            {
              label: "Interviewers dislike informal language",
              correct: false,
              explanation:
                "Tone isn't the problem; you can be casual and still excellent. What fails is the lack of hypothesis, root cause, and prevention.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 5. BUG 3: THE FETCH RACE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Story 3, the fetch race condition</h2>
        <p className="mb-4">
          This is the strongest of the four because it&apos;s a <em>production</em> bug that only shows under real latency,
          which is itself part of the story.
        </p>
        <pre><code>{`// SYMPTOM: search box shows results for the WRONG query when typing fast
useEffect(() => {
  fetch(\`/api/search?q=\${query}\`)
    .then((r) => r.json())
    .then(setResults); // whichever response lands last wins
}, [query]);`}</code></pre>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Symptom:</strong> &quot;Users reported the search results sometimes didn&apos;t match what they&apos;d typed. It never reproduced locally.&quot;</li>
          <li><strong>Investigation:</strong> &quot;The &lsquo;never reproduces locally&rsquo; part was the clue, localhost has no latency. I added timestamped logging on each response, throttled my network in DevTools, and watched an older request resolve <em>after</em> a newer one.&quot;</li>
          <li><strong>Root cause:</strong> &quot;Responses have no ordering guarantee. Typing fast fires overlapping requests, and a slow earlier one can resolve last and overwrite the correct results with stale data.&quot;</li>
          <li><strong>Fix:</strong> &quot;Cancel superseded requests with an <code>AbortController</code> in the effect cleanup, or, in production, switch to a query cache keyed by the query string so the library handles ordering.&quot;</li>
          <li><strong>Prevention:</strong> &quot;Adopt a server-cache tool so individual components stop hand-rolling fetches, and always test data-fetching UI under throttled network, not just localhost.&quot;</li>
        </ul>
        <Callout variant="warn" title="The detail that makes it senior">
          <p>
            &quot;It never reproduced locally&quot; is the line that elevates this. It shows you understand <em>why</em> the bug
            hid, no latency on localhost, and that you know to test under realistic conditions. Naming the testing gap
            is itself a piece of the root-cause analysis.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 6. BUG 4: KEY AS INDEX ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Story 4, <code>key={"{index}"}</code> on a reorderable list</h2>
        <p className="mb-4">
          The subtle one. The bug isn&apos;t a crash, it&apos;s <em>wrong-looking</em> behavior that&apos;s maddening to track down.
        </p>
        <pre><code>{`// SYMPTOM: deleting one row clears the wrong row's input text
{items.map((item, index) => (
  <Row key={index} item={item} /> // index as key on a list that reorders
))}`}</code></pre>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Symptom:</strong> &quot;A list of rows, each with an editable input. Deleting one row left the text in the <em>wrong</em> row, the input contents jumped around.&quot;</li>
          <li><strong>Investigation:</strong> &quot;The data was correct in state, I logged it. So the bug was in how React was <em>reconciling</em> the DOM, not in my data. That pointed straight at keys.&quot;</li>
          <li><strong>Root cause:</strong> &quot;Keys were the array index. When a row is removed, every row after it shifts index, so React thinks the elements are the <em>same</em> components with changed props, it reuses the DOM nodes and their internal state (the input text) lands on the wrong row.&quot;</li>
          <li><strong>Fix:</strong> &quot;Use a stable, unique <code>item.id</code> as the key. Now React tracks each row by identity across reorders and moves the right DOM node, and its state, with it.&quot;</li>
          <li><strong>Prevention:</strong> &quot;Never use index as a key for any list that can reorder, insert, or delete; enable the lint warning and treat &lsquo;the data&apos;s right but the UI&apos;s wrong&rsquo; as a keys smell.&quot;</li>
        </ul>
        <Callout variant="insight" title="The diagnostic heuristic worth saying">
          <p>
            &quot;When state is correct but the UI shows it in the wrong place, I suspect reconciliation, and the first thing
            I check is keys.&quot; That heuristic shows you can <em>localize</em> a bug to a layer before you even open the
            component. Interviewers notice that.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-classic-bugs" moduleSlug={MODULE_SLUG} title="The course's classic bugs">
        <Quiz
          kind="Root cause"
          question="A setInterval started in a useEffect with [] deps calls setCount(count + 1) but the counter sticks at 1. What's the root cause?"
          options={[
            {
              label: "A stale closure: the effect runs once, so the callback captured count from the first render (0) and never sees updates",
              correct: true,
              explanation:
                "Correct. With empty deps the interval closes over the first render's count forever. The functional updater setCount(c => c + 1) fixes it by not depending on the captured value.",
            },
            {
              label: "setInterval is unreliable in React and drops ticks",
              correct: false,
              explanation:
                "The interval fires fine, you can log it. The problem is the value the callback can see, not the timer's reliability.",
            },
            {
              label: "useState batches the updates and discards all but the first",
              correct: false,
              explanation:
                "Batching isn't the cause. Each tick genuinely computes 0 + 1 because count is frozen at 0 in the captured closure.",
            },
          ]}
        />
        <Quiz
          kind="Diagnosis"
          question="Deleting a row leaves text in the wrong row, but the data in state is correct. What do you suspect first?"
          options={[
            {
              label: "Reconciliation, specifically key={index} on a list that reorders, so React reuses DOM nodes and their state lands on the wrong row",
              correct: true,
              explanation:
                "Exactly. 'Data correct, UI wrong' is a keys smell. Index keys break identity tracking across reorders/deletes; a stable item.id fixes it.",
            },
            {
              label: "A bug in your delete handler that mutates the wrong array element",
              correct: false,
              explanation:
                "You already confirmed the data in state is correct, so the handler is fine. The mismatch is in how React maps state to DOM, i.e. keys.",
            },
            {
              label: "A race condition between the delete and a re-fetch",
              correct: false,
              explanation:
                "No fetch is involved, and the data is correct. The wrong-row symptom with correct data is the classic index-as-key reconciliation bug.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 7. TELLING IT WELL ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Telling it well, delivery, not just content</h2>
        <p className="mb-4">
          You have the structure and four ready bugs. The last skill is <em>delivery</em>. A few rules that keep a story
          tight and senior:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Lead with the symptom in one concrete sentence.</strong> &quot;Search results didn&apos;t match what users typed&quot; beats &quot;there was an async issue.&quot;</li>
          <li><strong>Use &quot;I&quot;, not &quot;we&quot;.</strong> The interviewer wants to know what <em>you</em> did. &quot;We&quot; hides your contribution.</li>
          <li><strong>Make the investigation a narrative of hypotheses.</strong> &quot;I thought it might be X, so I tested Y, which ruled it out&quot;, that&apos;s the gold.</li>
          <li><strong>Don&apos;t dramatize the difficulty.</strong> &quot;Hardest bug of my life&quot; sets a bar you may not clear. Let the clean root-cause analysis impress them.</li>
          <li><strong>End on prevention.</strong> Always land the plane on &quot;and here&apos;s how I made sure it couldn&apos;t happen again.&quot;</li>
        </ul>
        <Callout variant="info" title="Two minutes, not ten">
          <p>
            A debugging story should be tellable in under two minutes. If it runs long, you&apos;re narrating every dead end.
            Compress the dead ends into &quot;I ruled out a couple of things&quot; and spend your words on the hypothesis that
            cracked it. Rehearse with a timer until each story fits the window without notes.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 8. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks 'tell me about a hard bug you fixed'">
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Symptom first.</strong> One concrete sentence about what broke, ideally something that &quot;only happened in production.&quot;</li>
            <li><strong>Investigation as hypotheses.</strong> &quot;I noticed it correlated with X, hypothesized Y, and tested it by Z.&quot;</li>
            <li><strong>Root cause, named precisely.</strong> The actual mechanism, stale closure, response ordering, reconciliation by index.</li>
            <li><strong>Fix that addresses the cause.</strong> The functional updater, an <code>AbortController</code>, a stable key.</li>
            <li><strong>Prevention.</strong> A lint rule, a tool, or a testing habit that kills the whole class of bug. Always end here.</li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 9. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, three stories, rehearsed cold</h2>
        <p className="mb-4">
          Turn three of this course&apos;s bugs into polished, two-minute stories, then rehearse telling each without notes.
          Reusing bugs you genuinely understand beats inventing impressive-sounding ones you can&apos;t defend under
          follow-up.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Pick three bugs.</strong> Good picks: the stale closure, the fetch race, and the index-as-key bug,
            they span JS, async, and React internals, so you have a story ready whatever angle the interviewer takes.
          </li>
          <li>
            <strong>Write each in five beats.</strong> Symptom → investigation → root cause → fix → prevention, one or
            two sentences per beat. Force the investigation beat to read as a sequence of hypotheses.
          </li>
          <li>
            <strong>Add a &quot;only in production&quot; hook</strong> where it fits (the fetch race is perfect). Explaining why a
            bug hid is itself part of the root-cause analysis.
          </li>
          <li>
            <strong>Rehearse out loud against a timer.</strong> Each story under two minutes, no notes. If it runs long,
            compress the dead ends and keep the cracking hypothesis.
          </li>
          <li>
            <strong>Anticipate the follow-up.</strong> For each story, prepare for &quot;how would you have caught this
            earlier?&quot; (testing/observability) and &quot;what else could cause that symptom?&quot;, interviewers always push.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            The fetch race is the front-end cousin of a stale write in a distributed system, an older request lands
            after a newer one and clobbers correct data. If you&apos;ve debugged last-write-wins or out-of-order message
            delivery, you can tell that story with the front-end framing and it lands just as well.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-telling-it" moduleSlug={MODULE_SLUG} title="Telling it well">
        <Quiz
          kind="Delivery"
          question="When narrating the investigation beat, what's the most effective approach?"
          options={[
            {
              label: "Tell it as a sequence of hypotheses: 'I thought it might be X, tested Y, which ruled it out, then noticed Z'",
              correct: true,
              explanation:
                "Yes. The hypothesis-test-narrow narrative is where you demonstrate how you think, far more valuable than the one-line fix that follows it.",
            },
            {
              label: "List every dead end in full detail to show thoroughness",
              correct: false,
              explanation:
                "Narrating every dead end blows past two minutes and buries the point. Compress them to 'I ruled out a couple of things' and spend words on the cracking hypothesis.",
            },
            {
              label: "Skip straight to the fix to respect the interviewer's time",
              correct: false,
              explanation:
                "Skipping the investigation throws away the most valuable part. The fix is the punchline; the investigation is the answer.",
            },
          ]}
        />
        <Quiz
          kind="Choosing a bug"
          question="Why reuse a bug you deeply understand rather than inventing an impressive-sounding one?"
          options={[
            {
              label: "Interviewers push with follow-ups; a bug you truly understand holds up under 'what else could cause that?' and 'how would you prevent it?'",
              correct: true,
              explanation:
                "Exactly. A fabricated or shallow story collapses on the first probing follow-up. A bug you genuinely fixed lets you go deep on demand.",
            },
            {
              label: "Made-up bugs are against the rules of most interviews",
              correct: false,
              explanation:
                "There's no formal rule, the issue is practical: you can't defend a story you don't understand once the follow-ups start.",
            },
            {
              label: "Real bugs are always more technically impressive than invented ones",
              correct: false,
              explanation:
                "Not necessarily more impressive, but always more defensible. The point is surviving follow-ups, not raw impressiveness.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
