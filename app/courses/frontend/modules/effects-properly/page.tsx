import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "effects-properly";

const CHECKPOINTS = [
  { id: "cp-effects-are-sync", title: "Effects are synchronization, not lifecycle" },
  { id: "cp-deps-and-cleanup", title: "Dependencies + cleanup — getting both right" },
  { id: "cp-you-dont-need-an-effect", title: "When you don't need an effect at all" },
];

export default function EffectsProperlyModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 3 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          <code>useEffect</code>{" "}properly — lifecycle, deps, cleanup, and what an effect isn&apos;t for
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Most React bugs in interview homework involve <code>useEffect</code>{" "}used as a hammer for things that aren&apos;t nails. The cure: see effects as <em>synchronization</em>{" "}with the outside world, and reach for them last.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Imagine your React state is a thermostat reading. Inside React, everything is pure data — set the reading, read the reading, derive things from the reading. But the <em>furnace</em>{" "}lives outside React. Whenever the reading changes, something has to walk down to the basement and turn the dial.
        </p>
        <p>
          That walk down to the basement is <code>useEffect</code>. It&apos;s the door between the React world (props, state, JSX) and the outside world (DOM APIs, network, subscriptions, timers). Use it to <em>synchronize</em>{" "}an external system to your React state — and nothing else.
        </p>
        <Callout variant="insight" title="The mental shift">
          Effects are not &quot;run after render.&quot;{" "}They&apos;re &quot;keep this external thing in sync with these React values.&quot;{" "}The dependency array names the React values to track.
        </Callout>
      </section>

      <section>
        <h2>The shape of an effect</h2>
        <pre><code>{`useEffect(() => {
  // setup — runs after every commit whose deps changed
  const id = setInterval(tick, 1000);

  return () => {
    // cleanup — runs before the next setup, and on unmount
    clearInterval(id);
  };
}, [tick]);   // deps — React tracks identity changes here`}</code></pre>
        <p>
          Three pieces:
        </p>
        <ol>
          <li><strong>Setup function</strong>{" "}— runs after the component is committed to the DOM. Use it to subscribe, start a timer, attach a listener, fire a fetch.</li>
          <li><strong>Cleanup function</strong>{" "}— returned from setup. Runs <em>before</em>{" "}the next setup and on unmount. Use it to unsubscribe, clear timers, detach, abort.</li>
          <li><strong>Dependency array</strong>{" "}— the React values the effect reads from the render. When any change (by <code>Object.is</code>), React tears down the previous effect (cleanup) and runs setup again.</li>
        </ol>
      </section>

      <section>
        <h2>The dependency array is a closure capture, not a list of triggers</h2>
        <p>
          A common mental model is: &quot;deps are the things that should re-run the effect.&quot;{" "}That&apos;s true mechanically — but the deeper point is that the effect <em>closes over</em>{" "}every value it reads. If a value changes between renders and you don&apos;t list it, the effect runs with a <strong>stale</strong>{" "}value from the old closure.
        </p>
        <pre><code>{`useEffect(() => {
  const id = setInterval(() => {
    console.log(count);    // ❌ captures count from the render
                           //    when the effect was last set up
  }, 1000);
  return () => clearInterval(id);
}, []);   // ❌ wrong — count is read but not listed`}</code></pre>
        <p>
          The lint rule <code>react-hooks/exhaustive-deps</code>{" "}exists specifically for this. Trust it.
        </p>
        <p>
          Two correct fixes:
        </p>
        <ul>
          <li>List <code>count</code>{" "}in deps — the effect resubscribes whenever it changes. The interval restarts, but it&apos;s now correct.</li>
          <li>Use the functional updater pattern in the body — <code>setCount(prev =&gt; prev + 1)</code>{" "}— so the effect doesn&apos;t need to read <code>count</code>{" "}at all. Empty deps are fine.</li>
        </ul>
        <Callout variant="warn" title="Don't lie to the lint rule">
          Disabling <code>exhaustive-deps</code>{" "}is the single most common source of stale-closure bugs in React. If you find yourself reaching for the suppression comment, restructure the effect — usually by hoisting logic out of it.
        </Callout>
      </section>

      <Checkpoint id="cp-effects-are-sync" moduleSlug={MODULE_SLUG} title="Effects are synchronization, not lifecycle">
        <Quiz
          kind="Quick check"
          question="An effect reads `props.userId` to fetch user data. What should be in the dependency array?"
          options={[
            { label: "Empty array — fetch once on mount.", explanation: "Wrong — if `userId` changes, the effect needs to re-fetch. Without the dep, the displayed user goes stale." },
            { label: "`[userId]` — the value the effect reads.", correct: true, explanation: "Right — list everything the effect uses from render scope. React then re-syncs whenever the user changes." },
            { label: "`[props]` — the whole props object.", explanation: "Wrong — `props` is a new object every render, so the effect would re-fire constantly even when `userId` didn't change." },
            { label: "Nothing — useEffect doesn't need deps in React 19.", explanation: "Wrong — the dependency array is still the contract." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Cleanup — what it&apos;s really for</h2>
        <p>
          The cleanup function is the &quot;undo&quot; of the setup. It runs at two moments:
        </p>
        <ol>
          <li>Just before the next setup (because a dep changed and the effect is being re-run).</li>
          <li>When the component unmounts.</li>
        </ol>
        <p>
          You need it whenever the setup leaves something running in the outside world: subscriptions, timers, listeners, fetches, observers. Without cleanup, you leak — and in React 18 StrictMode, you&apos;ll <em>see</em>{" "}the leak as a duplicated handler.
        </p>
        <pre><code>{`// Subscribe to a store and unsubscribe on unmount
useEffect(() => {
  const sub = store.subscribe(setData);
  return () => sub.unsubscribe();
}, [store]);

// Add a window listener and remove it
useEffect(() => {
  const onResize = () => setW(window.innerWidth);
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);

// Abort an in-flight fetch on unmount or re-fire
useEffect(() => {
  const ctrl = new AbortController();
  fetch(\`/api/user/\${id}\`, { signal: ctrl.signal })
    .then(r => r.json())
    .then(setUser)
    .catch((e) => { if (e.name !== "AbortError") throw e; });
  return () => ctrl.abort();
}, [id]);`}</code></pre>
        <Callout variant="info" title="StrictMode fires effects twice — on purpose">
          In development, React 18 StrictMode mounts each component, unmounts it, and mounts it again. Effects run twice (setup → cleanup → setup). It&apos;s a stress test for your cleanup. If toggling routes leaks listeners or duplicates network requests, your cleanup is wrong. The double-fire goes away in production.
        </Callout>
      </section>

      <Checkpoint id="cp-deps-and-cleanup" moduleSlug={MODULE_SLUG} title="Dependencies + cleanup — getting both right">
        <Quiz
          kind="Scenario"
          question="You subscribe to a WebSocket in `useEffect` with no cleanup. In dev (StrictMode), how does this fail?"
          options={[
            { label: "It doesn't — dev and prod behave identically.", explanation: "Wrong — StrictMode in React 18+ deliberately double-fires effects." },
            { label: "You see two open sockets, each receiving messages. UI updates duplicate.", correct: true, explanation: "Right — StrictMode mounts twice. Without cleanup, each mount opens a fresh socket; both stay alive." },
            { label: "The first effect cancels the second automatically.", explanation: "Wrong — React doesn't auto-cancel anything. You must return a cleanup." },
            { label: "It silently fails in dev only.", explanation: "Wrong — it actively misbehaves in dev. That's the point — StrictMode surfaces leaks before production." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>You might not need an effect</h2>
        <p>
          This is the heading of the React docs page that has saved more interview homework than any other. The shortlist:
        </p>
        <ul>
          <li><strong>Derived data</strong>{" "}— don&apos;t <code>setState</code>{" "}from an effect to compute <code>fullName = firstName + lastName</code>. Compute it inline during render.</li>
          <li><strong>Event handlers</strong>{" "}— don&apos;t use an effect to react to a button click. Put the logic in the <code>onClick</code>{" "}directly.</li>
          <li><strong>Initial state</strong>{" "}— don&apos;t use an effect to set initial state from props. Use a state initializer (<code>useState(() =&gt; computeFrom(props))</code>) or just use the prop directly.</li>
          <li><strong>Resetting state when a prop changes</strong>{" "}— don&apos;t use an effect to clear form state when <code>userId</code>{" "}changes. Pass <code>key={`{userId}`}</code>{" "}to the form; React remounts it, fresh state.</li>
          <li><strong>Caching expensive calculations</strong>{" "}— use <code>useMemo</code>, not an effect that writes derived data to state.</li>
        </ul>
        <Callout variant="warn" title="The smell">
          If your effect&apos;s only job is to call <code>setSomething</code>{" "}based on the deps you listed, you almost certainly don&apos;t need the effect. You&apos;re doing in two renders what you could do in one.
        </Callout>
        <pre><code>{`// ❌ unnecessary effect — sync state from state
useEffect(() => {
  setFullName(\`\${first} \${last}\`);
}, [first, last]);

// ✅ derive during render
const fullName = \`\${first} \${last}\`;`}</code></pre>
        <p>
          The effect version costs you an extra render (state → effect → setState → render again) and introduces a sync bug window where <code>fullName</code>{" "}is briefly stale.
        </p>
      </section>

      <Checkpoint id="cp-you-dont-need-an-effect" moduleSlug={MODULE_SLUG} title="When you don't need an effect at all">
        <Quiz
          kind="Quick check"
          question="A `<UserForm>` should reset all its inputs when the `userId` prop changes. What's the cleanest pattern?"
          options={[
            { label: "`useEffect(() => setFields(defaults), [userId])`.", explanation: "Works, but causes two renders (old fields → reset). And it's easy to forget which fields to reset." },
            { label: "Pass `key={userId}` to the form. React unmounts and remounts the form on each id change, giving fresh state for free.", correct: true, explanation: "Right — `key` is the React-native way to say 'this is a different instance.' All state inside is reset automatically." },
            { label: "Use `useMemo` to depend on `userId`.", explanation: "Wrong — `useMemo` caches a value; it doesn't reset state in children." },
            { label: "Wrap the form in another component.", explanation: "Wrapping alone doesn't reset state. You still need either a key or an effect; the key is the cleaner solution." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="You have `useEffect(() => { setBlue(red * 2) }, [red])`. What's a better implementation?"
          options={[
            { label: "Keep it — that's how derived state works.", explanation: "Wrong — `blue` doesn't need to be state. It can be computed each render." },
            { label: "Compute `blue` inline: `const blue = red * 2`. Remove the state and the effect.", correct: true, explanation: "Right — `blue` is derived. There's no reason to store it; deriving inline is simpler and removes the extra render." },
            { label: "Use `useMemo` for `blue`.", explanation: "Overkill unless the computation is expensive. Plain assignment is fine and cheaper." },
            { label: "Move it to `useLayoutEffect`.", explanation: "Wrong — that's for measuring layout before paint. It doesn't change the fundamental issue (derived data shouldn't be in state)." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li>An effect is a <strong>synchronization</strong>{" "}between React state and an external system (DOM, network, subscription, timer). Not a lifecycle, not an &quot;after render&quot; callback.</li>
          <li>The <strong>dependency array</strong>{" "}lists every React value the effect closes over. Missing deps = stale data. Trust <code>react-hooks/exhaustive-deps</code>.</li>
          <li>The <strong>cleanup function</strong>{" "}is the undo of setup. It runs before the next setup and on unmount. Subscriptions, timers, listeners, and in-flight fetches all need one.</li>
          <li><strong>StrictMode</strong>{" "}in dev fires every effect twice on mount — a stress test for cleanup. Misbehavior here means real leaks in production.</li>
          <li><strong>You might not need an effect</strong>{" "}for: derived data (compute inline), event handlers (use the JSX handler), state resets on prop change (use <code>key</code>), or copies of props into state.</li>
          <li>The smell: an effect whose only job is to call <code>setX</code>{" "}from other state.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <ol>
          <li>Take a starting component that has 4 effects: one syncing <code>fullName</code>{" "}from name parts, one fetching on <code>userId</code>, one adding a global keyboard listener, and one setting state from a prop. Remove the effects that shouldn&apos;t exist (1, 4). Keep the genuine sync points (2, 3) but verify both have correct deps and cleanup.</li>
          <li>Open the form in StrictMode dev — confirm the network request fires twice. Verify your fetch aborts via <code>AbortController</code>{" "}so the second request supersedes the first cleanly.</li>
          <li>Add a route change to the form&apos;s parent. Confirm the keyboard listener detaches (use the network/event panel) and the fetch aborts.</li>
          <li>Refactor a &quot;reset form on userId change&quot; effect to use <code>key={`{userId}`}</code>{" "}on the form component. Delete the effect.</li>
        </ol>
        <p>
          You should be able to explain — out loud — why <em>not</em>{" "}reaching for an effect is the right answer most of the time, and what cleanup buys you in StrictMode and production.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
