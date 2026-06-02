import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "system-design-frontend";

const CHECKPOINTS = [
  { id: "cp-frame", title: "Clarify before you draw" },
  { id: "cp-state-data", title: "State location & data flow" },
  { id: "cp-tradeoffs", title: "Perf, a11y & tradeoffs" },
];

export default function SystemDesignFrontendModule() {
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
          Front-end system design, how to drive the whiteboard
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          A front-end design interview isn&apos;t a trivia round, it&apos;s a 45-minute audition for how you think.
          The candidates who pass don&apos;t know more APIs; they <em>drive a process</em>. Here&apos;s the framework that
          turns a blank whiteboard into a structured conversation you control.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. WHAT IS BEING TESTED ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">What they&apos;re actually measuring</h2>
        <p className="mb-4">
          The prompt will be deceptively open: &quot;Design the front end for a typeahead search.&quot; &quot;Design a news feed.&quot;
          &quot;Design a chat UI.&quot; A junior hears that and starts drawing components immediately. A senior hears it as a
          set of <em>unanswered questions</em> and spends the first few minutes turning the vague prompt into a scoped
          problem. That gap is the whole interview.
        </p>
        <p className="mb-4">
          The interviewer is grading four things, and almost none of them is &quot;did you get the right answer&quot;, there
          isn&apos;t one:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Structure.</strong> Do you have a repeatable process, or do you flail?</li>
          <li><strong>Tradeoff awareness.</strong> Every choice costs something. Do you name the cost out loud?</li>
          <li><strong>Communication.</strong> Are you thinking <em>with</em> them, or performing at them in silence?</li>
          <li><strong>Depth on demand.</strong> When they push on one corner, can you go deep without losing the thread?</li>
        </ul>
        <Callout variant="insight" title="The one-sentence reframe">
          <p>
            A front-end design interview is a conversation where <strong>you propose, you name the tradeoff, and you
            invite the interviewer to redirect.</strong> The whiteboard is a shared artifact, not a test you submit at
            the end. Treat every silence as a chance to say &quot;here&apos;s what I&apos;m considering and why.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. THE FRAMEWORK ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The framework: five stages, in order</h2>
        <p className="mb-4">
          Memorize this spine. When the prompt lands and your mind goes blank, you fall back to the sequence and start
          talking. It scales from a 30-minute screen to a 60-minute onsite, you just spend more time per stage.
        </p>
        <pre><code>{`1. CLARIFY      requirements, scope, constraints, scale
2. STRUCTURE    component architecture + data flow
3. STATE        where each piece of state lives
4. FETCHING     how data gets in, cached, kept fresh
5. TRADEOFFS    perf, accessibility, edge cases, "what I'd do next"`}</code></pre>
        <p className="mb-4">
          The order matters. Clarify gates everything: you can&apos;t choose a fetching strategy until you know whether the
          data updates in real time. State decisions fall out of the component tree. Perf and a11y come last not because
          they&apos;re least important, but because you can&apos;t reason about them until the design exists.
        </p>
        <Callout variant="warn" title="The trap: jumping to stage 2">
          <p>
            The single most common failure is sketching boxes in the first 60 seconds. It feels productive, you&apos;re
            &quot;making progress&quot;, but you&apos;re designing for a problem you haven&apos;t defined. Slow down. The clarify stage is
            where seniority shows; rushing it is the clearest junior tell there is.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. STAGE 1: CLARIFY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Stage 1, clarify (the stage that separates levels)</h2>
        <p className="mb-4">
          Spend a real three to five minutes here. Ask questions whose answers actually change your design, not
          ritual questions you ask and then ignore. A good clarifying question makes the interviewer think
          &quot;oh, good, they&apos;d catch that on a real project.&quot;
        </p>
        <p className="mb-4">For a typeahead search, the questions that move the design:</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Functional scope.</strong> Just suggestions, or a full results page below? Keyboard nav required? Recent searches? Categories?</li>
          <li><strong>Data shape &amp; size.</strong> How many results per query, 10 or 10,000? Is the result list virtualized?</li>
          <li><strong>Freshness.</strong> Static catalog, or do results change second-to-second (e.g. live inventory)?</li>
          <li><strong>Scale &amp; latency.</strong> Mobile users on 3G? What&apos;s the p95 backend latency? That decides debounce timing and whether we need optimistic UI.</li>
          <li><strong>Accessibility &amp; platform.</strong> Screen-reader support assumed? Which browsers? Is this inside an existing design system?</li>
        </ul>
        <p className="mb-4">
          Then <strong>state your assumptions out loud and write them in a corner of the board.</strong> &quot;I&apos;ll assume
          we want suggestions plus a results feed, up to a few hundred results so we&apos;ll virtualize, and the catalog is
          near-real-time so we can&apos;t cache aggressively. Stop me if any of that&apos;s wrong.&quot; Now you have a scoped problem
          and the interviewer has had a chance to redirect you before you&apos;ve spent any effort.
        </p>
        <Callout variant="info" title="Scope down, then offer to scope up">
          <p>
            Always shrink the problem to a buildable core first: &quot;Let me design the core typeahead, then if we have time
            I&apos;ll add recent-searches and analytics.&quot; This shows judgment about <em>what matters most</em> and protects you
            from running out of time mid-feature. Interviewers love a candidate who scopes deliberately.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 4. STAGE 2: STRUCTURE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Stage 2, component architecture &amp; data flow</h2>
        <p className="mb-4">
          Now you draw. Decompose the UI into a component tree, top-down, and draw arrows for how data flows. For the
          typeahead:
        </p>
        <pre><code>{`<SearchBox>                 // owns the query + orchestration
  <SearchInput />           // controlled input, debounced
  <Suggestions>             // dropdown of suggestions
    <SuggestionItem />      // one row, keyboard-highlightable
  </Suggestions>
  <ResultsFeed>             // the results below
    <VirtualizedList>       // windowing for large lists
      <ResultCard />
    </VirtualizedList>
  </ResultsFeed>
</SearchBox>`}</code></pre>
        <p className="mb-4">
          As you draw, narrate the <em>why</em>: &quot;<code>SearchBox</code> is the orchestrator, it owns the query and
          coordinates the request, so the input and the suggestions list can stay dumb and presentational.&quot; That single
          sentence tells the interviewer you understand container/presentational separation without you ever having to
          name the pattern.
        </p>
        <Callout variant="insight" title="Draw the data flow, not just the boxes">
          <p>
            Boxes alone are a wireframe. Arrows are a <em>design</em>. Show: query flows down from <code>SearchBox</code>,
            keystrokes flow up via <code>onChange</code>, the fetched results flow back down. The arrows are where you
            demonstrate you understand React&apos;s one-way data flow, the thing Phase 3 was entirely about.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-frame" moduleSlug={MODULE_SLUG} title="Clarify before you draw">
        <Quiz
          kind="Process"
          question="The interviewer says 'design a typeahead search'. What should you do in the first three minutes?"
          options={[
            {
              label: "Ask clarifying questions whose answers change the design (scope, data size, freshness, scale, a11y), then state your assumptions out loud",
              correct: true,
              explanation:
                "Yes. Clarifying is the stage that separates levels. You turn a vague prompt into a scoped problem and give the interviewer a chance to redirect before you've invested any effort.",
            },
            {
              label: "Immediately start drawing the component tree so you look productive",
              correct: false,
              explanation:
                "This is the classic junior tell. Drawing boxes before defining the problem means you're designing for a spec you haven't pinned down, and it's the most common way to lose the interview.",
            },
            {
              label: "Pick a state management library and justify it",
              correct: false,
              explanation:
                "Way too early, and library-first thinking is a red flag. State location comes after the component tree exists, and most 'state' here is server cache anyway.",
            },
          ]}
        />
        <Quiz
          kind="Scoping"
          question="Why scope the problem down to a core before adding features?"
          options={[
            {
              label: "It shows judgment about what matters most and protects you from running out of time mid-feature",
              correct: true,
              explanation:
                "Exactly. 'Core typeahead first, then recent-searches if we have time' demonstrates prioritization and keeps you in control of the clock.",
            },
            {
              label: "Because interviewers don't want to see advanced features",
              correct: false,
              explanation:
                "They do, but only after the core is solid. Scoping down then offering to scope up signals exactly the judgment they're grading for.",
            },
            {
              label: "Because a smaller design is always the correct production design",
              correct: false,
              explanation:
                "Not the point, production scope depends on requirements. In the interview, scoping is about time management and demonstrating prioritization, not about the 'right' final size.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 5. STAGE 3: STATE LOCATION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Stage 3, where does each piece of state live?</h2>
        <p className="mb-4">
          This is where Phase 5 pays off. Run every piece of state down the decision tree out loud, the interviewer
          is listening for exactly this reasoning:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>The query string</strong>, local to <code>SearchBox</code>, or in the URL? If results should be shareable/bookmarkable, the URL (<code>?q=...</code>) is the right home.</li>
          <li><strong>The results</strong>, <em>not</em> client state. They&apos;re a cache of something the server owns, keyed by the query. This is a React Query / SWR job, not <code>useState</code>.</li>
          <li><strong>Highlighted suggestion index</strong>, pure UI state, local to the dropdown.</li>
          <li><strong>Recent searches</strong>, persisted, maybe <code>localStorage</code>; arguably its own small store.</li>
        </ul>
        <p className="mb-4">
          The senior move is to say <strong>&quot;most of what looks like state here is actually server cache or URL
          state&quot;</strong>, then the genuinely-local slice shrinks to almost nothing. Naming the category correctly is the
          whole skill.
        </p>
        <Callout variant="info" title="Server cache vs client state, said in the room">
          <p>
            &quot;The results aren&apos;t state I own, they&apos;re a stale copy of what the server owns, keyed by the query. So I&apos;d
            model them with a cache like React Query: the <code>queryKey</code> is the query, I get dedup and staleness for
            free, and I don&apos;t hand-roll the race condition.&quot; That sentence collapses three Phase 5 modules into one
            confident answer.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 6. STAGE 4: FETCHING ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Stage 4, the fetching strategy</h2>
        <p className="mb-4">
          For a typeahead, this is where the interviewer probes hardest, because it&apos;s a perfect storm of every
          data-fetching pitfall. Walk through it deliberately:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Debounce the input.</strong> Don&apos;t fire a request per keystroke, wait ~200–300ms after the user stops typing. Mention you&apos;d tune this against measured latency, not guess.</li>
          <li><strong>Handle the race condition.</strong> Responses arrive out of order; an older query can resolve last and overwrite the newer one. Fix with an <code>AbortController</code> (cancel superseded requests) or a cache keyed by query.</li>
          <li><strong>Cache by query.</strong> Re-typing a recent query should hit the cache, not the network. <code>queryKey</code> handles this.</li>
          <li><strong>Model four states.</strong> Loading, error, empty (&quot;no results for <em>x</em>&quot;), and data, each with distinct UI.</li>
        </ul>
        <p className="mb-4">
          If you say &quot;debounce, abort superseded requests, cache by query, and model loading/error/empty/data
          explicitly,&quot; you&apos;ve demonstrated the entire data-fetching module in four sentences. That&apos;s the payoff of the
          course structure: design answers are just the modules, recombined.
        </p>
        <Callout variant="warn" title="Don't say 'I'd just use useEffect and fetch'">
          <p>
            It&apos;s the wrong default and the interviewer knows the failure modes. If you must hand-roll it, immediately
            name the race condition and the cleanup fix in the same breath, that turns a weak answer into a strong one
            by proving you know <em>why</em> the naive version is dangerous.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-state-data" moduleSlug={MODULE_SLUG} title="State location & data flow">
        <Quiz
          kind="State location"
          question="In a typeahead design, where should the fetched results live?"
          options={[
            {
              label: "In a server-cache tool (React Query/SWR) keyed by the query, they're a cache of server-owned data, not client state",
              correct: true,
              explanation:
                "Correct. Results are a stale copy of what the server owns. Modeling them as a cache keyed by query gives you dedup, staleness, and race handling for free, and stops you reinventing it badly.",
            },
            {
              label: "In a global Redux store so any component can read them",
              correct: false,
              explanation:
                "Reaching for Redux here is a red flag, the results are server cache, not genuinely-global client state. Naming the category correctly usually removes the need for a global store entirely.",
            },
            {
              label: "In useState inside SearchBox, fetched via useEffect",
              correct: false,
              explanation:
                "This is the wrong default, it leaves you hand-rolling caching, dedup, and the race condition. If you go this route you must name the race and its fix immediately.",
            },
          ]}
        />
        <Quiz
          kind="Data flow"
          question="Why draw arrows for data flow, not just component boxes?"
          options={[
            {
              label: "Arrows show you understand React's one-way data flow, query down, events up, results back down",
              correct: true,
              explanation:
                "Right. Boxes are a wireframe; arrows are a design. They're where you demonstrate the one-way data flow that the whole React mental model rests on.",
            },
            {
              label: "Arrows are required by the interview rubric",
              correct: false,
              explanation:
                "There's no rubric demanding arrows. They matter because they communicate data flow, the substance, not a formality.",
            },
            {
              label: "Because two-way binding is the React default and arrows show both directions",
              correct: false,
              explanation:
                "React is one-way by default, not two-way binding. The arrows specifically show props flowing down and events flowing up.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 7. STAGE 5: TRADEOFFS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Stage 5, perf, accessibility &amp; tradeoffs out loud</h2>
        <p className="mb-4">
          The last stretch is where you separate yourself. Don&apos;t wait to be asked, proactively raise the corners a
          senior would care about, name the tradeoff, and pick a side with a reason.
        </p>
        <p className="mb-4"><strong>Performance:</strong></p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Virtualize</strong> the results list if it can be large, render only the visible window, not 5,000 DOM nodes.</li>
          <li><strong>Debounce</strong> input to cut request volume; consider canceling in-flight requests on the next keystroke.</li>
          <li>Be wary of <strong>premature memoization</strong>, measure first; <code>useMemo</code> everywhere is a smell, not a strategy.</li>
        </ul>
        <p className="mb-4"><strong>Accessibility</strong> (a senior raises this unprompted):</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>The combobox pattern: <code>role=&quot;combobox&quot;</code>, <code>aria-expanded</code>, <code>aria-activedescendant</code> for the highlighted option.</li>
          <li>Full keyboard operability, arrow keys move the highlight, Enter selects, Escape closes.</li>
          <li><code>aria-live</code> to announce result counts (&quot;12 results&quot;) to screen-reader users.</li>
        </ul>
        <p className="mb-4">
          Then close with the senior signature move: <strong>&quot;Here&apos;s what I&apos;d build first, here&apos;s what I&apos;d punt, and
          here&apos;s what I&apos;d measure before optimizing.&quot;</strong> That single sentence demonstrates prioritization,
          humility, and a measurement-first instinct all at once.
        </p>
        <Callout variant="insight" title="The phrase that signals seniority">
          <p>
            &quot;There&apos;s a tradeoff here.&quot; Say it constantly. Debounce time trades latency for request volume. Virtualization
            trades implementation complexity for memory. Caching trades freshness for speed. Every time you name a
            tradeoff and pick a side <em>with a reason</em>, you sound like someone who&apos;s shipped real software, because
            you have.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 8. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks 'how do you approach a front-end design interview?'">
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Clarify first.</strong> Turn the vague prompt into a scoped problem, ask about functional scope, data size, freshness, scale, and a11y, then state my assumptions out loud.</li>
            <li><strong>Structure.</strong> Draw a component tree and the data-flow arrows, props down, events up.</li>
            <li><strong>State location.</strong> Run each piece down the tree: server data is a cache, shareable state goes in the URL, the rest is local, lifted no higher than the closest common ancestor.</li>
            <li><strong>Fetching.</strong> Debounce, abort superseded requests, cache by key, and model loading/error/empty/data explicitly.</li>
            <li><strong>Tradeoffs.</strong> Virtualization, accessibility (combobox + keyboard + <code>aria-live</code>), and &quot;here&apos;s what I&apos;d measure before optimizing.&quot;</li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 9. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, run a full mock end to end</h2>
        <p className="mb-4">
          Design a <strong>typeahead-search-with-results-feed</strong> front end on paper, narrating the tradeoffs as you
          go. The goal isn&apos;t a perfect diagram, it&apos;s rehearsing the <em>process</em> until it&apos;s automatic under pressure.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Clarify on paper.</strong> Write down five clarifying questions and the assumption you&apos;d state for each.
            Force yourself to make every question one whose answer changes the design.
          </li>
          <li>
            <strong>Draw the tree and the arrows.</strong> Sketch <code>SearchBox</code> down to <code>ResultCard</code>,
            then add the data-flow arrows. Say out loud which component owns the query and why.
          </li>
          <li>
            <strong>Place every piece of state.</strong> Query, results, highlight index, recent searches, write where
            each lives and the one-line reason. Catch yourself if you call server cache &quot;state.&quot;
          </li>
          <li>
            <strong>Talk through fetching.</strong> Debounce timing, the race condition and its fix, caching by query,
            and the four states. Pretend the interviewer just asked &quot;what happens when I type fast?&quot;
          </li>
          <li>
            <strong>Close on tradeoffs.</strong> Virtualization, the combobox a11y pattern, and one &quot;what I&apos;d measure
            before optimizing&quot; line. Time yourself, the whole walkthrough should fit in 20–30 minutes.
          </li>
          <li>
            <strong>Stretch, change a requirement.</strong> Have a friend say &quot;now results update in real time.&quot; Redesign
            the fetching layer (websocket/polling, cache invalidation) on the fly. Adapting gracefully to a thrown
            curveball is the most senior signal of all.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you&apos;ve done backend system design, the muscle transfers: clarify requirements, identify the bottleneck,
            name the tradeoff, pick a side. The front-end version just swaps &quot;sharding vs replication&quot; for &quot;where does
            state live&quot; and &quot;how do I keep a cache fresh.&quot; Same discipline, different layer.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-tradeoffs" moduleSlug={MODULE_SLUG} title="Perf, a11y & tradeoffs">
        <Quiz
          kind="Performance"
          question="The results list can hold thousands of items. What's the right performance move, and what's the trap?"
          options={[
            {
              label: "Virtualize the list (render only the visible window); the trap is memoizing everything prematurely instead of measuring first",
              correct: true,
              explanation:
                "Correct. Windowing keeps the DOM small regardless of list size. And the senior instinct is measure-before-optimize, sprinkling useMemo everywhere is a smell, not a strategy.",
            },
            {
              label: "Memoize every component with React.memo to prevent all re-renders",
              correct: false,
              explanation:
                "Premature, blanket memoization is exactly the trap. It adds cost and complexity without measuring, and a fresh object/function prop defeats memo anyway. Virtualization is the real fix for list size.",
            },
            {
              label: "Render all items but hide off-screen ones with display:none",
              correct: false,
              explanation:
                "Those nodes are still in the DOM and still cost layout/memory. Virtualization actually removes off-screen nodes from the tree; display:none does not.",
            },
          ]}
        />
        <Quiz
          kind="Accessibility"
          question="What's the accessible pattern for the typeahead's suggestion dropdown?"
          options={[
            {
              label: "The combobox pattern: role=combobox, aria-expanded, aria-activedescendant for the highlight, full keyboard nav, and aria-live for result counts",
              correct: true,
              explanation:
                "Yes, raising this unprompted is a strong seniority signal. The combobox roles plus keyboard operability and a live region for counts is what a screen-reader user actually needs.",
            },
            {
              label: "Add tabindex to every suggestion so users can Tab through them",
              correct: false,
              explanation:
                "Tabbing through every option is the wrong interaction model for a combobox, the input keeps focus and aria-activedescendant points at the highlighted option as arrow keys move it.",
            },
            {
              label: "Accessibility isn't relevant to a design interview; skip it",
              correct: false,
              explanation:
                "The opposite, proactively raising a11y is one of the clearest senior signals. Skipping it reads as not knowing it matters.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
