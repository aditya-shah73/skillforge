import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "data-fetching";

const CHECKPOINTS = [
  { id: "cp-race", title: "The race condition" },
  { id: "cp-fixes", title: "Ignore flag & AbortController" },
  { id: "cp-states-waterfalls", title: "Four states & waterfalls" },
];

export default function DataFetchingModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 5 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Data fetching in React, the <code>useEffect</code> trap and the race condition
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          You wired up <code>useEffect</code> + <code>fetch</code> in thirty seconds and it worked. Then a user typed fast,
          and your search box started showing answers to the <em>wrong question</em>. Let&apos;s understand why, and fix it the way an interviewer wants to hear.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The mailroom that ignores postmarks</h2>
        <p className="mb-4">
          Imagine you mail a letter asking a question, then, before the reply comes back, you change your mind and mail
          a second letter with a <em>different</em> question. Two replies are now in transit. You&apos;ve decided on a rule:
          <strong> act on whichever reply lands in my mailbox last.</strong>
        </p>
        <p className="mb-4">
          That rule only works if replies arrive in the order you sent them. They don&apos;t. The post office makes no such
          promise, the second letter might get a fast courier and the first might sit in a depot for a week. When the
          slow first reply finally lands, your &quot;last one wins&quot; rule cheerfully acts on it, answering a question you
          already abandoned.
        </p>
        <p className="mb-4">
          That is <em>exactly</em> what a naive <code>useEffect</code> fetch does. Each render fires off a request (mails a
          letter). Each response calls <code>setState</code> (acts on whatever reply just landed). The network gives no
          ordering guarantee. The state you end up with is the state of <em>whichever response resolved last</em>, not
          the one you actually asked for. That mismatch is the <strong>race condition</strong>, and it is the single most
          common bug in hand-rolled data fetching.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            The mechanics of <code>fetch</code> are easy. The hard part is the <em>lifecycle</em>: requests are async and
            outlive the render that started them, components re-render and unmount while requests are in flight, and React
            never automatically cancels anything you started. Everything below follows from those three facts.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. THE NAIVE PATTERN ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The pattern everyone writes first</h2>
        <p className="mb-4">
          Here&apos;s the code that lives in a million tutorials and a million first drafts. It looks innocent:
        </p>
        <pre><code>{`function Profile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then((res) => res.json())
      .then((data) => setUser(data)); // <- act on whatever comes back
  }, [userId]);

  return <h1>{user?.name}</h1>;
}`}</code></pre>
        <p className="mb-4">
          It renders the right thing most of the time, which is exactly why it survives code review. But as a
          <em> default</em> it is wrong, and here is the full list of what it quietly skips:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>No cleanup.</strong> When <code>userId</code> changes, the effect re-runs and fires a second request,
            but the first one is still in flight. Two responses, no rule for which wins. (The race condition.)
          </li>
          <li>
            <strong>No loading state.</strong> While the request is in flight, <code>user</code> is <code>null</code>, so
            you render an empty heading. The UI lies about what&apos;s happening.
          </li>
          <li>
            <strong>No error handling.</strong> The <code>.then()</code> chain has no <code>.catch()</code>. A 500, a
            dropped connection, or bad JSON throws into the void.
          </li>
          <li>
            <strong>HTTP errors look like success.</strong> <code>fetch</code> only rejects on <em>network</em> failure. A
            404 or 500 resolves normally, you have to check <code>res.ok</code> yourself, and this code doesn&apos;t.
          </li>
          <li>
            <strong>setState after unmount.</strong> If the component unmounts before the response lands, you call
            <code>setUser</code> on a dead component, wasted work, and historically a warning.
          </li>
          <li>
            <strong>No caching, no dedupe.</strong> Mount the same component twice and you fetch the same data twice.
          </li>
        </ul>
        <Callout variant="warn" title="&quot;But it works on my machine&quot;">
          <p>
            On localhost every response comes back in two milliseconds, in order, every time. The race condition is
            invisible until real latency and real users show up. That&apos;s what makes it dangerous: the bug ships because
            it never reproduces where you test.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. THE RACE CONDITION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The race condition, step by step (this is the interview answer)</h2>
        <p className="mb-4">
          Picture a search box. Every keystroke updates <code>query</code>, and an effect fires a fetch keyed on it:
        </p>
        <pre><code>{`function Search({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(\`/api/search?q=\${query}\`)
      .then((res) => res.json())
      .then((data) => setResults(data)); // <- the trap
  }, [query]);

  return <ResultList items={results} />;
}`}</code></pre>
        <p className="mb-4">
          Now the user types <strong>fast</strong>. Watch the timeline. Say the server happens to be slower for short
          queries (less to narrow on, bigger result set, totally plausible):
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-6">
          <li>User types <code>&quot;a&quot;</code>. Effect runs → fires <strong>Request A</strong> for <code>q=a</code>.</li>
          <li>User types <code>&quot;b&quot;</code> (query is now <code>&quot;ab&quot;</code>). Effect re-runs → fires <strong>Request B</strong> for <code>q=ab</code>.</li>
          <li>
            <strong>Request B resolves first.</strong> <code>setResults(resultsForAB)</code>. The screen correctly shows
            results for <code>&quot;ab&quot;</code>. Looks perfect.
          </li>
          <li>
            <strong>Request A resolves second</strong>, the slow, stale one. <code>setResults(resultsForA)</code>
            overwrites the screen.
          </li>
          <li>
            Final state: the input box says <code>&quot;ab&quot;</code>, but the list shows results for <code>&quot;a&quot;</code>. The
            UI is internally inconsistent and there is no error, no log, nothing pointing at why.
          </li>
        </ol>
        <Callout variant="insight" title="Say this in the interview, verbatim">
          <p>
            &quot;Effects start async requests but don&apos;t order their responses. When a dependency changes faster than
            requests resolve, an older request can resolve <em>after</em> a newer one and overwrite the correct state with
            stale data. The fix is to ignore (or abort) the response of any request whose effect has been superseded, you
            do that in the effect&apos;s cleanup function.&quot;
          </p>
        </Callout>
        <p className="mb-4">
          The crucial mental model: <strong>the bug is not in <code>fetch</code>, it&apos;s in trusting response order.</strong>
          The fix is never &quot;make requests faster.&quot; The fix is making the component <em>ignore answers to questions it no
          longer cares about.</em> React hands us the perfect hook for that: cleanup.
        </p>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-race" moduleSlug={MODULE_SLUG} title="The race condition">
        <Quiz
          kind="Race condition"
          question="A search box fires a fetch on every keystroke from useEffect with no cleanup. The user types 'a' then 'ab'. Request for 'a' resolves AFTER the request for 'ab'. What does the user see?"
          options={[
            {
              label: "The list shows results for 'a', even though the input says 'ab'",
              correct: true,
              explanation:
                "Right. The last setState to run wins, and that's the stale 'a' response. The UI is now inconsistent: input says 'ab', results are for 'a'. This is the race condition.",
            },
            {
              label: "The list shows results for 'ab', because React tracks the latest dependency",
              explanation:
                "No, React re-runs the effect for 'ab' but it does not cancel or order the in-flight 'a' request. Whichever response calls setState last wins, regardless of which query is current.",
            },
            {
              label: "React throws an error because two requests are in flight at once",
              explanation:
                "No error is thrown. Both requests resolve normally; the problem is purely that the stale one resolves last and overwrites correct state silently.",
            },
            {
              label: "Only the first request ever runs; the second is debounced automatically",
              explanation:
                "useEffect does no debouncing. Every dependency change re-runs the effect and fires another request.",
            },
          ]}
        />
        <Quiz
          kind="Root cause"
          question="What is the actual root cause of the search-box race condition?"
          options={[
            {
              label: "Network responses have no guaranteed ordering, and the naive effect acts on whichever lands last",
              correct: true,
              explanation:
                "Exactly. The async responses can arrive in any order; the code assumes the latest request resolves last. Removing that assumption (ignore/abort) is the fix.",
            },
            {
              label: "fetch is too slow and needs to be replaced with axios",
              explanation:
                "The library is irrelevant, axios has the identical race. Speed is not the issue; response ordering is.",
            },
            {
              label: "useState batches updates incorrectly",
              explanation:
                "Batching isn't involved. Each response is a separate, correctly-applied setState; the problem is that a stale one runs last.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. FIX 1: IGNORE FLAG ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Fix #1, the <code>ignore</code> flag in cleanup</h2>
        <p className="mb-4">
          React calls an effect&apos;s <strong>cleanup function before re-running the effect</strong> (and on unmount). That
          gives us a hook to mark the previous request as obsolete. The classic, minimal fix is a boolean captured in the
          effect&apos;s closure:
        </p>
        <pre><code>{`function Search({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let ignore = false; // fresh per effect run

    fetch(\`/api/search?q=\${query}\`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setResults(data); // only the live run is allowed to commit
      });

    return () => {
      ignore = true; // cleanup: this run is now stale
    };
  }, [query]);

  return <ResultList items={results} />;
}`}</code></pre>
        <p className="mb-4">Replay the fast-typing timeline with this in place:</p>
        <ol className="mb-4 list-decimal space-y-2 pl-6">
          <li>Type <code>&quot;a&quot;</code> → effect runs, creates <code>ignoreA = false</code>, fires Request A.</li>
          <li>
            Type <code>&quot;ab&quot;</code> → React runs the <em>previous</em> cleanup first, setting <code>ignoreA = true</code>.
            Then the new effect runs with its own <code>ignoreB = false</code> and fires Request B.
          </li>
          <li>Request B resolves → <code>ignoreB</code> is <code>false</code> → <code>setResults</code> runs. Correct.</li>
          <li>
            Request A resolves late → its closure sees <code>ignoreA === true</code> → the <code>setResults</code> is
            skipped. The stale response is dropped on the floor. No overwrite.
          </li>
        </ol>
        <p className="mb-4">
          The magic is that each effect run has its <em>own</em> <code>ignore</code> variable (closure per run). Cleanup
          flips the previous run&apos;s flag, so a late response can check &quot;am I still the live request?&quot; and quietly bow out
          if not. This also fixes the setState-after-unmount problem for free: unmount runs cleanup too.
        </p>
        <Callout variant="info" title="It drops the result, it doesn't stop the request">
          <p>
            The <code>ignore</code> flag is a <em>guard at the finish line</em>. Request A still travels the network, the
            server still does the work, the bytes still come back, you just refuse to act on them. That&apos;s enough to fix
            the UI bug. To stop wasting the network itself, we need to actually cancel the request.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. FIX 2: ABORTCONTROLLER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Fix #2, <code>AbortController</code> (cancel the work, not just the result)</h2>
        <p className="mb-4">
          <code>AbortController</code> gives you a <code>signal</code> you hand to <code>fetch</code>, plus an
          <code>abort()</code> method. Call <code>abort()</code> in cleanup and the browser <strong>cancels the in-flight
          request</strong>: the connection is torn down and the promise rejects with an <code>AbortError</code>.
        </p>
        <pre><code>{`function Search({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(\`/api/search?q=\${query}\`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch((err) => {
        if (err.name === "AbortError") return; // expected on cleanup — swallow it
        // real error: surface it (see the error-state section)
        console.error(err);
      });

    return () => {
      controller.abort(); // cleanup cancels the request outright
    };
  }, [query]);

  return <ResultList items={results} />;
}`}</code></pre>
        <p className="mb-4">
          The timeline is now even cleaner: typing <code>&quot;ab&quot;</code> aborts Request A <em>mid-flight</em>. It never
          resolves with data, it rejects with <code>AbortError</code>, which we recognize and swallow. The server may stop
          processing it; the bytes never come back to overwrite anything.
        </p>
        <Callout variant="warn" title="You must handle AbortError">
          <p>
            Aborting makes the fetch promise <em>reject</em>, not silently disappear. If you don&apos;t check for
            <code>err.name === &quot;AbortError&quot;</code>, every keystroke that cancels a previous request will look like a real
            error and could flash an error state. Swallow the <code>AbortError</code>; treat everything else as a genuine
            failure.
          </p>
        </Callout>
        <p className="mb-4">Two valid fixes, which do you reach for?</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Ignore flag</strong>, simpler, no API to learn, fixes the UI bug. The request still completes; you
            just discard the result. Great default for small components.
          </li>
          <li>
            <strong>AbortController</strong>, also stops the network work and frees the connection. Strictly better when
            requests are expensive, frequent (typeahead!), or you&apos;re on a metered/slow connection. Slightly more
            ceremony because you must handle <code>AbortError</code>.
          </li>
        </ul>
        <p className="mb-4">
          They&apos;re not mutually exclusive, but in practice <code>AbortController</code> alone covers the race <em>and</em>
          the wasted work, so it&apos;s the stronger answer when an interviewer asks for &quot;the production fix.&quot;
        </p>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-fixes" moduleSlug={MODULE_SLUG} title="Ignore flag & AbortController">
        <Quiz
          kind="Cleanup timing"
          question="With the `ignore` flag fix, why does a late stale response get dropped?"
          options={[
            {
              label: "Before re-running the effect, React runs the previous cleanup, which sets that run's ignore=true; the stale response checks its own ignore and skips setState",
              correct: true,
              explanation:
                "Yes. Each effect run closes over its own `ignore`. Cleanup flips the old run's flag to true, so when the stale response lands it sees ignore===true and refuses to call setState.",
            },
            {
              label: "React automatically cancels the old fetch when dependencies change",
              explanation:
                "React never cancels fetches for you. The ignore flag doesn't cancel anything either, it just guards the setState. (AbortController is what cancels.)",
            },
            {
              label: "The two effect runs share one ignore variable, so the second run overwrites it",
              explanation:
                "They don't share it, each run has its own closure-scoped `ignore`. That separation is exactly what makes the fix work.",
            },
          ]}
        />
        <Quiz
          kind="Abort vs ignore"
          question="What does AbortController do that the ignore flag does NOT?"
          options={[
            {
              label: "It cancels the in-flight network request, so the server work and the bytes coming back are also stopped, not just the setState",
              correct: true,
              explanation:
                "Correct. The ignore flag is a finish-line guard (request still completes, result discarded). AbortController cancels the request itself, saving network and server work. You must swallow the resulting AbortError.",
            },
            {
              label: "It guarantees responses arrive in the order they were sent",
              explanation:
                "Nothing guarantees response ordering, that's the whole problem. AbortController cancels superseded requests rather than ordering them.",
            },
            {
              label: "It debounces keystrokes so fewer requests fire",
              explanation:
                "AbortController doesn't debounce; it cancels already-fired requests. Debouncing is a separate, complementary technique.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. FOUR STATES ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Loading / error / empty / success, four first-class states</h2>
        <p className="mb-4">
          The naive pattern models data as &quot;the data, or null.&quot; That collapses three completely different situations
          into one ambiguous <code>null</code>: <em>we haven&apos;t loaded yet</em>, <em>it failed</em>, and <em>it succeeded
          but there&apos;s nothing to show.</em> Every fetch has <strong>four</strong> states, and good UI models all of them
          explicitly:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>loading</strong>, request in flight. Show a spinner/skeleton, not an empty shell.</li>
          <li><strong>error</strong>, the request (or <code>res.ok</code> check) failed. Show a message and ideally a retry.</li>
          <li><strong>empty</strong>, success, but zero results. &quot;No matches for <em>xyz</em>&quot;, not a blank screen that looks broken.</li>
          <li><strong>success-with-data</strong>, the happy path.</li>
        </ul>
        <p className="mb-4">A compact, honest version of the search component models all four:</p>
        <pre><code>{`function Search({ query }) {
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) { setStatus("idle"); return; }
    const controller = new AbortController();
    setStatus("loading");

    fetch(\`/api/search?q=\${query}\`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`); // fetch won't do this for you
        return res.json();
      })
      .then((data) => {
        setResults(data);
        setStatus("success");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setStatus("error");
      });

    return () => controller.abort();
  }, [query]);

  if (status === "loading") return <Spinner />;
  if (status === "error")   return <ErrorBanner onRetry={/* re-trigger */} />;
  if (status === "success" && results.length === 0) return <Empty query={query} />;
  return <ResultList items={results} />;
}`}</code></pre>
        <Callout variant="insight" title="Don't infer state from data shape">
          <p>
            <code>results.length === 0</code> means two different things depending on <code>status</code>: during
            <code>loading</code> it means &quot;not yet,&quot; during <code>success</code> it means &quot;genuinely empty.&quot; A single
            explicit <code>status</code> variable removes the ambiguity. Inferring loading from <code>data === null</code>
            is how you get spinners that never disappear and empty states that flash before data arrives.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. WATERFALLS VS PARALLEL ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Waterfalls vs parallel fetches</h2>
        <p className="mb-4">
          When you need several pieces of data, <em>how</em> you await them decides whether they run back-to-back or at the
          same time. Sequential <code>await</code>s on <em>independent</em> data create a <strong>request waterfall</strong>:
          each request waits for the previous one to finish, even though none of them needed the others&apos; results.
        </p>
        <pre><code>{`// WATERFALL — three round-trips end to end (slow)
const user = await fetchUser(id);        // wait...
const posts = await fetchPosts(id);      // ...then wait...
const friends = await fetchFriends(id);  // ...then wait

// PARALLEL — one round-trip's worth of waiting (fast)
const [user, posts, friends] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchFriends(id),
]);`}</code></pre>
        <p className="mb-4">
          Use the waterfall <em>only</em> when there&apos;s a real dependency, e.g. you need the user&apos;s <code>teamId</code>
          before you can fetch the team. For anything independent, fire them together with <code>Promise.all</code> and
          wait once. (If one failing shouldn&apos;t doom the rest, <code>Promise.allSettled</code> lets each resolve or reject
          on its own.)
        </p>
        <Callout variant="warn" title="Waterfalls hide inside component trees too">
          <p>
            A parent fetches, renders a child, the child fetches, that&apos;s a waterfall spread across components, and it&apos;s
            harder to spot than three <code>await</code>s in a row. It&apos;s one of the big reasons frameworks push data
            loading up to routes/Server Components, where independent loads can be kicked off together.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 8. HONEST CONCLUSION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Why dedicated data tools exist (the honest conclusion)</h2>
        <p className="mb-4">
          Look back at everything we had to hand-write for one search box: a cleanup guard or abort, four explicit states,
          an <code>res.ok</code> check, <code>AbortError</code> handling, and we <em>still</em> haven&apos;t added caching,
          deduping, retries, refetch-on-focus, or pagination. Do that for every endpoint in your app and you&apos;ve
          accidentally rebuilt a data-fetching library, badly.
        </p>
        <p className="mb-4">
          That is precisely why these tools exist. The next module covers <strong>server-cache state</strong> with libraries
          like React Query / SWR, which give you the cache, dedupe, retries, and the four states out of the box, you
          describe <em>what</em> to fetch, they own the lifecycle. Beyond that, <strong>Server Components and framework data
          loading</strong> (the App Router, loaders) move the fetch to the server entirely, sidestepping the client
          race condition class altogether.
        </p>
        <Callout variant="info" title="The nuanced take">
          <p>
            <code>useEffect</code> + <code>fetch</code> is not <em>banned</em>. For a genuine one-off, a single
            non-cached call, a tiny widget, a prototype, the cleanup-guarded version is perfectly fine. The lesson is that
            it&apos;s the wrong <strong>default</strong>. The moment you have more than one or two fetches, reach for a tool
            built for the job rather than re-deriving its hard parts in each component.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 9. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;what&apos;s wrong with useEffect + fetch?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Race condition.</strong> Responses have no guaranteed order; a stale request can resolve last and
              overwrite correct state. Fix it in cleanup: an <code>ignore</code> flag (drop the result) or an
              <code>AbortController</code> (cancel the request, handle <code>AbortError</code>).
            </li>
            <li>
              <strong>Four states.</strong> Model loading, error, empty, and success-with-data explicitly, don&apos;t infer
              them from <code>data === null</code>.
            </li>
            <li>
              <strong>HTTP errors aren&apos;t rejections.</strong> <code>fetch</code> resolves on 404/500; check
              <code>res.ok</code> yourself.
            </li>
            <li>
              <strong>Parallelize.</strong> Independent fetches go in <code>Promise.all</code>, not sequential
              <code>await</code>s (avoid waterfalls).
            </li>
            <li>
              <strong>It&apos;s the wrong default.</strong> Fine for one-offs; reach for React Query / Server Components once
              you have real data needs.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 10. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, break it, then fix it twice</h2>
        <p className="mb-4">
          You&apos;ll build a search box that <em>visibly</em> races, then apply both fixes and watch the bug disappear. Seeing
          the race with your own eyes is what makes this stick.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Build a fake search API with variable latency.</strong> Write a function that resolves search results
            after a delay, and make <em>short queries slower</em> (e.g. <code>delay = 800 - query.length * 150</code> ms).
            That artificial latency is what makes the race reproduce on every fast keystroke instead of only under bad
            network conditions.
          </li>
          <li>
            <strong>Write the naive racing component.</strong> A controlled input updating <code>query</code>, and a
            <code>useEffect</code> keyed on <code>query</code> that fetches and calls <code>setResults</code> with
            <em>no cleanup</em>. Type &quot;react&quot; fast. Confirm the visible bug: the input says &quot;react&quot; but the results
            settle on an earlier, shorter query. Log each response as it lands so you can see them arrive out of order.
          </li>
          <li>
            <strong>Fix it with the ignore flag.</strong> Add <code>let ignore = false</code>, guard the
            <code>setResults</code> with <code>if (!ignore)</code>, and return a cleanup that sets <code>ignore = true</code>.
            Type fast again, keep your logs and watch the stale responses get dropped instead of committed.
          </li>
          <li>
            <strong>Fix it with AbortController instead.</strong> Swap the ignore flag for a <code>controller</code>, pass
            <code>signal</code> to <code>fetch</code>, <code>abort()</code> in cleanup, and add a <code>.catch</code> that
            swallows <code>AbortError</code>. Watch in the Network tab: superseded requests now show as
            <em>cancelled</em>, not completed.
          </li>
          <li>
            <strong>Add the four states.</strong> Introduce a <code>status</code> variable (loading / error / empty /
            success), an <code>res.ok</code> check that throws on HTTP errors, and render a distinct UI for each state,
            including a real &quot;No results for <em>x</em>&quot; empty state.
          </li>
          <li>
            <strong>Stretch, kill a waterfall.</strong> Have each result load a detail blob and an author in parallel with
            <code>Promise.all</code> instead of two sequential <code>await</code>s, and compare the total time.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you come from server work: this is the client-side cousin of a request you can&apos;t cancel writing to a row
            after a newer request already updated it. <code>AbortController</code> is your client-side request cancellation,
            and the <code>ignore</code> flag is an optimistic-concurrency check (&quot;am I still the latest writer?&quot;) applied
            to UI state. Same problem, different layer.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-states-waterfalls" moduleSlug={MODULE_SLUG} title="Four states & waterfalls">
        <Quiz
          kind="Four states"
          question="Why is modeling fetch state as just 'data or null' a problem?"
          options={[
            {
              label: "null collapses three distinct situations, not-yet-loaded, errored, and successful-but-empty, into one ambiguous value",
              correct: true,
              explanation:
                "Exactly. An explicit status (loading/error/empty/success) disambiguates them, preventing spinners that never end and empty states that flash before data lands.",
            },
            {
              label: "null isn't allowed as a useState initial value in React",
              explanation:
                "null is a perfectly valid state value. The issue isn't legality, it's that one null can't represent three different meanings.",
            },
            {
              label: "It's actually fine; you can always check results.length === 0",
              explanation:
                "results.length === 0 is ambiguous on its own: during loading it means 'not yet', during success it means 'genuinely empty'. You need status to tell them apart.",
            },
          ]}
        />
        <Quiz
          kind="Waterfalls"
          question="You need a user, their posts, and their friends, and none depends on the others. What's the right approach?"
          options={[
            {
              label: "Fire all three together with Promise.all and await once",
              correct: true,
              explanation:
                "Correct. Independent requests should run in parallel so you wait roughly one round-trip instead of three. Sequential awaits here would be a needless waterfall.",
            },
            {
              label: "await each one in sequence so they don't overload the server",
              explanation:
                "Three independent sequential awaits is a waterfall, each waits for the prior with no dependency reason. That's the slow anti-pattern you want to avoid.",
            },
            {
              label: "Only fetch the user; derive posts and friends from it on the client",
              explanation:
                "You can't derive separately-stored posts and friends from the user object, they're independent fetches. Parallelize them.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
