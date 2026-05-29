import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "usecontext";

const CHECKPOINTS = [
  { id: "cp-what-context-is-for", title: "What context is — and isn't — for" },
  { id: "cp-the-rerender-rule", title: "The re-render rule + the new-object trap" },
  { id: "cp-splitting-and-limits", title: "Splitting contexts + when context is the wrong tool" },
];

export default function UseContextModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 4 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          <code>useContext</code>{" "}— without the provider hell or the re-render storms
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Context is React&apos;s building-wide PA system: broadcast once, every floor hears it. The trap is forgetting that <em>every</em>{" "}listener wakes up on every announcement — even when the announcement was &quot;nothing changed.&quot;
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy: a PA system, not a chain of notes</h2>
        <p>
          Picture an office building. You need to get the words &quot;the theme is now dark mode&quot;{" "}to every desk on every floor.
        </p>
        <p>
          <strong>Option A — prop drilling.</strong>{" "}You write the message on a note and hand it desk to desk. The mail room gives it to the second-floor receptionist, who walks it to a manager, who passes it to a team lead, who finally hands it to the person who actually cares. Everyone in the chain had to physically touch a note they didn&apos;t want, just to relay it. In React terms, that&apos;s threading a prop through ten components that don&apos;t use it — they only pass it down.
        </p>
        <p>
          <strong>Option B — the PA system.</strong>{" "}You walk up to one microphone in the lobby and say it once: &quot;the theme is now dark mode.&quot;{" "}Anyone in the building who has a speaker tuned in hears it directly. No relaying. That microphone is a context <strong>Provider</strong>; the speaker on each desk is <code>useContext</code>; the announcement is the context <em>value</em>.
        </p>
        <p>
          This is the whole pitch of context: a value at the top of the tree becomes readable by any descendant, no matter how deep, without passing it through the components in between.
        </p>
        <Callout variant="insight" title="The one-line mental model">
          Context is a wormhole through the component tree for a value. The Provider is the entrance, <code>useContext</code>{" "}is the exit, and everything between the two is bypassed entirely.
        </Callout>
        <p>
          But hold onto the PA analogy, because it also explains the failure mode. When the announcement plays, <em>every speaker in the building blares</em> — even the ones in empty rooms, even when the new announcement is identical to the last one. That&apos;s the re-render storm we&apos;ll spend the back half of this module taming. First, let&apos;s make sure we&apos;re even using the microphone for the right kind of message.
        </p>
      </section>

      <section>
        <h2>What context is FOR (and what it is NOT for)</h2>
        <p>
          Context is excellent for a narrow band of data: <strong>app-wide values that change rarely and are read in many far-apart places.</strong>{" "}The canonical examples:
        </p>
        <ul>
          <li><strong>Theme</strong>{" "}— light/dark, brand colors, spacing scale. Flips occasionally, read everywhere.</li>
          <li><strong>The current user / auth session</strong>{" "}— who is logged in, their roles. Set at login, read in the header, the sidebar, route guards.</li>
          <li><strong>Locale / i18n</strong>{" "}— the active language and a translation function. Changes on a settings toggle, read by every label.</li>
          <li><strong>A configured client or service</strong>{" "}— a router, an analytics client, a feature-flag object. Created once, consumed deep.</li>
        </ul>
        <p>
          Notice the shared shape: <em>slow-changing</em>, <em>genuinely global</em>, and <em>painful to prop-drill</em>. If a value has all three properties, context earns its keep.
        </p>
        <p>
          Now the part people skip. Context is <strong>NOT</strong>{" "}a general-purpose state manager, and it is <strong>NOT</strong>{" "}a performance optimization. Reach for something else when:
        </p>
        <ul>
          <li><strong>The value changes frequently.</strong>{" "}Mouse position, scroll offset, a text input&apos;s current characters, an animation frame value. Each change re-renders every consumer (more on why below). High-frequency context is a performance bug waiting to happen.</li>
          <li><strong>Only a couple of nearby components need it.</strong>{" "}If the data travels one or two levels, just pass a prop. Context adds indirection and a Provider boundary you now have to reason about. Don&apos;t pay that cost to avoid a single prop.</li>
          <li><strong>It&apos;s server data / a cache.</strong>{" "}&quot;The list of orders from the API&quot;{" "}is server state — it needs fetching, caching, revalidation, and loading/error states. Context can <em>hold</em> it but gives you none of that machinery. We&apos;ll meet the right tools in Phase 5.</li>
        </ul>
        <Callout variant="warn" title="Context is not a state manager — it's a transport">
          Context only solves <em>delivery</em>{" "}— getting a value from A to deep-down B without intermediaries. It does not decide <em>how</em>{" "}state updates, batches, caches, or persists. Pair it with <code>useState</code>{" "}or <code>useReducer</code>{" "}(which own the state) and context just moves the result around.
        </Callout>
        <p>
          A good gut check: ask &quot;would I be happy if every component reading this re-rendered each time it changed?&quot;{" "}For a theme that flips twice a session, sure. For a cursor position updating sixty times a second, absolutely not.
        </p>
      </section>

      <section>
        <h2>The mechanics: createContext / Provider / useContext</h2>
        <p>
          Three moving parts, and you&apos;ll use all three every time.
        </p>
        <p>
          <strong>1. <code>createContext(defaultValue)</code></strong>{" "}— creates the context object. The default is only used when a component calls <code>useContext</code>{" "}with <em>no matching Provider above it</em>. In real apps that default is usually a deliberate &quot;you forgot the Provider&quot;{" "}sentinel, like <code>null</code>.
        </p>
        <pre><code>{`// theme-context.tsx
import { createContext, useContext } from "react";

type Theme = "light" | "dark";
type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

// null default => calling useTheme outside a provider is a bug we can catch.
const ThemeContext = createContext<ThemeContextValue | null>(null);`}</code></pre>
        <p>
          <strong>2. The Provider</strong>{" "}— every context object carries a <code>.Provider</code>{" "}component. It takes one prop, <code>value</code>, and makes that value available to everything it wraps.
        </p>
        <pre><code>{`import { useState, useCallback } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const toggle = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}`}</code></pre>
        <p>
          <strong>3. <code>useContext(TheContext)</code></strong>{" "}— reads the value from the nearest matching Provider above. The convention is to wrap it in a custom hook that also enforces the Provider is present:
        </p>
        <pre><code>{`export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error("useTheme must be used inside a <ThemeProvider>");
  }
  return ctx;
}

// usage, arbitrarily deep — no props threaded through the middle:
function ThemeToggleButton() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>Theme: {theme}</button>;
}`}</code></pre>
        <Callout variant="info" title="Why wrap useContext in a custom hook">
          Three wins for free: (1) the <code>null</code>{" "}check turns a confusing &quot;cannot read property of null&quot;{" "}into a clear error, (2) consumers import <code>useTheme</code>{" "}instead of both <code>useContext</code>{" "}and the raw context object, and (3) you can change the internal representation later without touching every call site. We&apos;ll formalize this &quot;extract a custom hook&quot;{" "}move in the next module.
        </Callout>
        <p>
          One layout note: a component can only read a context if it&apos;s rendered <em>inside</em>{" "}the Provider. The Provider itself, and components that render the Provider, are above it and can&apos;t see the value. So Providers usually wrap near the root of the app (or the root of a feature subtree).
        </p>
        <Callout variant="warn" title="Nearest provider wins">
          If you nest two Providers of the same context, a consumer reads the <strong>closest one above it</strong>. This is occasionally useful (a section override) and occasionally a head-scratcher when you accidentally double-wrap and read a stale inner value.
        </Callout>

        <Checkpoint id="cp-what-context-is-for" moduleSlug={MODULE_SLUG} title="What context is — and isn't — for">
          <Quiz
            kind="Quick check"
            question="Which of these is the BEST fit for context?"
            options={[
              { label: "The current x/y position of the mouse, updated on every mousemove", explanation: "High-frequency updates are the classic anti-pattern: every consumer re-renders on every move. Use local state, a ref, or a dedicated subscription instead." },
              { label: "The logged-in user object, set at login and read by the header, sidebar, and route guards", correct: true, explanation: "Slow-changing, genuinely app-wide, and painful to prop-drill to far-apart consumers. That's the sweet spot for context." },
              { label: "A boolean passed from a parent to its only child", explanation: "One level deep — just pass a prop. Context adds a Provider boundary and indirection you don't need here." },
              { label: "The array of orders returned from a /orders API call", explanation: "That's server state — it needs fetching, caching, and revalidation. Context can hold it but gives you none of that. Phase 5 covers the right tools." },
            ]}
          />
          <Quiz
            kind="Mechanics"
            question="When is the defaultValue passed to createContext(defaultValue) actually used?"
            options={[
              { label: "Every render, as a fallback merged with the Provider's value", explanation: "There's no merging. The Provider's value fully replaces the default for descendants inside it." },
              { label: "Only when a component calls useContext with no matching Provider above it in the tree", correct: true, explanation: "The default is the value a consumer sees when it's rendered outside any Provider. That's why a null default lets you detect a missing Provider." },
              { label: "Whenever the Provider's value is null or undefined", explanation: "If a Provider passes value={null}, consumers get null — the default does not kick back in. The default is purely about the absence of a Provider." },
              { label: "It's only for TypeScript types and has no runtime effect", explanation: "It has a real runtime effect: it's the value returned when no Provider is found above the consumer." },
            ]}
          />
        </Checkpoint>
      </section>

      <section>
        <h2>The re-render rule (this is the whole module)</h2>
        <p>
          Here is the rule, and it is non-negotiable:
        </p>
        <Callout variant="insight" title="The rule">
          When a Provider&apos;s <code>value</code>{" "}prop changes, <strong>every</strong>{" "}component that consumes that context with <code>useContext</code>{" "}re-renders — no matter how deep, no matter whether it reads the part of the value that actually changed. React decides &quot;changed&quot;{" "}with <code>Object.is(prevValue, nextValue)</code>.
        </Callout>
        <p>
          Back to the PA system: the announcement plays through <em>every</em>{" "}speaker tuned to that channel. A speaker can&apos;t say &quot;this part of the message wasn&apos;t for me, I&apos;ll stay quiet.&quot;{" "}It hears the whole broadcast or none of it.
        </p>
        <p>
          The critical word is <code>value</code>, and the critical comparison is <strong>identity</strong>, not deep equality. React doesn&apos;t look inside the value to see if the fields are the same. It asks one question: <em>is this the same value reference as last time?</em>{" "}If <code>Object.is(prev, next)</code>{" "}is <code>true</code>, consumers are left alone. If it&apos;s <code>false</code>, they all re-render.
        </p>

        <h3>The new-object-every-render trap</h3>
        <p>
          Look closely at the Provider we wrote earlier:
        </p>
        <pre><code>{`<ThemeContext.Provider value={{ theme, toggle }}>
  {children}
</ThemeContext.Provider>`}</code></pre>
        <p>
          That <code>{"{{ theme, toggle }}"}</code>{" "}is an <strong>object literal</strong>. JavaScript builds a brand-new object every time this component renders. New object means new reference. New reference means <code>Object.is(prev, next)</code>{" "}is <code>false</code> — even when <code>theme</code>{" "}and <code>toggle</code>{" "}are exactly what they were a moment ago.
        </p>
        <p>
          So here&apos;s the bug: imagine the <code>ThemeProvider</code>{" "}component re-renders for some <em>unrelated</em>{" "}reason — maybe a parent re-rendered, or it holds another piece of state like a counter that just ticked. The theme didn&apos;t change at all. But because the render produced a fresh <code>{"{ theme, toggle }"}</code>{" "}object, <em>every single theme consumer in the app re-renders.</em>{" "}A button three pages away repaints because a counter near the root incremented. That&apos;s the re-render storm.
        </p>
        <pre><code>{`function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [tick, setTick] = useState(0); // unrelated state!

  // Every time tick changes, this render makes a NEW object...
  const value = { theme, toggle: () => setTheme(t => t === "light" ? "dark" : "light") };

  // ...so every theme consumer re-renders, even though theme is unchanged.
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}`}</code></pre>
        <p>
          Two compounding mistakes are hiding in there. The object literal is one. The other is the inline <code>toggle: () =&gt; ...</code> — that arrow function is <em>also</em>{" "}freshly allocated each render, so even the function identity churns.
        </p>

        <h3>The fix: useMemo the value (and useCallback the functions)</h3>
        <p>
          Stabilize the value&apos;s identity so it only changes when its <em>contents</em>{" "}meaningfully change. <code>useMemo</code>{" "}returns the same object reference across renders until a dependency changes.
        </p>
        <pre><code>{`import { useState, useCallback, useMemo } from "react";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // Stable function identity across renders.
  const toggle = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    []
  );

  // Stable object identity: a new object ONLY when theme or toggle changes.
  // toggle never changes (empty deps), so this is really "new only when theme flips".
  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}`}</code></pre>
        <p>
          Now an unrelated re-render of <code>ThemeProvider</code>{" "}re-runs the function body, but <code>useMemo</code>{" "}sees that <code>theme</code>{" "}and <code>toggle</code>{" "}are unchanged and hands back the <em>same</em>{" "}object it returned last time. <code>Object.is(prev, next)</code>{" "}is <code>true</code>. Consumers stay asleep. The PA system only broadcasts when there&apos;s genuinely something new to say.
        </p>
        <Callout variant="warn" title="useMemo is only as stable as its dependencies">
          If you put an unstable value in the deps — say an inline arrow function or another object literal — <code>useMemo</code>{" "}recomputes every render and you&apos;re back where you started. That&apos;s exactly why <code>toggle</code>{" "}is wrapped in <code>useCallback</code>{" "}first. Stability has to go all the way down.
        </Callout>
        <Callout variant="info" title="A note on primitives">
          If your context value is a single primitive — a string, number, or boolean — you don&apos;t need <code>useMemo</code>. <code>Object.is(&quot;dark&quot;, &quot;dark&quot;)</code>{" "}is <code>true</code>. The trap is specifically about <em>objects and functions</em>, which are compared by reference. The moment you bundle multiple things into an object to pass through context, memoization becomes load-bearing.
        </Callout>

        <Checkpoint id="cp-the-rerender-rule" moduleSlug={MODULE_SLUG} title="The re-render rule + the new-object trap">
          <Quiz
            kind="Quick check"
            question="A Provider renders value={{ user, setUser }}. The user hasn't changed, but the Provider component re-rendered for an unrelated reason. What happens to components that call useContext on it?"
            options={[
              { label: "Nothing — React sees user is unchanged and skips them", explanation: "React does NOT look inside the object. It compares the object reference. A fresh literal each render is a new reference." },
              { label: "They all re-render, because the object literal is a new reference every render", correct: true, explanation: "Exactly. {{ user, setUser }} allocates a new object each render, so Object.is(prev, next) is false and every consumer re-renders even though user is identical." },
              { label: "Only the components that read user (not setUser) re-render", explanation: "Context can't do per-field subscriptions. Consuming the context at all means re-rendering when its value reference changes, regardless of which field you read." },
              { label: "React throws a warning about an unstable context value", explanation: "There's no such warning. The over-rendering is silent — which is exactly why this bug is so common." },
            ]}
          />
          <Quiz
            kind="Why"
            question="Why does wrapping the context value in useMemo fix the storm?"
            options={[
              { label: "useMemo deep-compares the object's fields and blocks re-renders when they match", explanation: "useMemo doesn't deep-compare anything. It returns a cached reference and only recomputes when a listed dependency changes by Object.is." },
              { label: "It returns the same object reference across renders until a dependency changes, so Object.is stays true and consumers don't re-render", correct: true, explanation: "Right — stable identity is the whole point. Same reference => Object.is true => consumers untouched until the contents actually change." },
              { label: "useMemo moves the value out of React's render cycle so it never triggers updates", explanation: "The value is still very much in the render cycle; useMemo just preserves its identity between renders. When deps change, it does update and consumers re-render — as intended." },
              { label: "It memoizes each consumer component instead of the value", explanation: "useMemo here memoizes the value object, not the consumers. (Memoizing consumers would be React.memo — a different tool for a different layer.)" },
            ]}
          />
        </Checkpoint>
      </section>

      <section>
        <h2>Splitting state from dispatch</h2>
        <p>
          Memoizing the value fixes the &quot;new object for no reason&quot;{" "}storm. But there&apos;s a subtler version that <code>useMemo</code>{" "}alone can&apos;t fix, and it shows up the moment your context holds both <em>state</em>{" "}and a way to <em>change</em>{" "}it.
        </p>
        <p>
          Consider a value like <code>{"{ count, dispatch }"}</code>. When <code>count</code>{" "}changes, the memoized object genuinely <em>should</em>{" "}get a new identity — its contents changed. So every consumer re-renders. That&apos;s correct for the components that <em>display</em>{" "}the count. But what about a component that only ever <em>increments</em>{" "}it — a button that calls <code>dispatch</code>{" "}and never reads <code>count</code> at all? It re-renders too, every single time the count changes, for nothing.
        </p>
        <p>
          The PA analogy strains here, so switch metaphors: think of two separate channels. One channel broadcasts the <em>current state</em>{" "}(&quot;the count is now 7&quot;). A different channel broadcasts only the <em>controls</em>{" "}(&quot;here is the button that changes the count&quot;). The controls channel almost never changes — the <code>dispatch</code>{" "}function from <code>useReducer</code>{" "}is stable for the component&apos;s entire life. So components that only need the controls can tune into the quiet channel and ignore the chatty one.
        </p>
        <p>
          Concretely: use <strong>two contexts</strong>. One carries state; one carries the dispatch (or setters).
        </p>
        <pre><code>{`import { createContext, useContext, useReducer } from "react";

type State = { count: number };
type Action = { type: "inc" } | { type: "dec" };

const CountStateContext = createContext<State | null>(null);
const CountDispatchContext = createContext<React.Dispatch<Action> | null>(null);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "inc": return { count: state.count + 1 };
    case "dec": return { count: state.count - 1 };
  }
}

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  // dispatch is referentially STABLE for the life of the component —
  // React guarantees it. So the dispatch context's value never changes identity,
  // and dispatch-only consumers never re-render from a count change.
  return (
    <CountStateContext.Provider value={state}>
      <CountDispatchContext.Provider value={dispatch}>
        {children}
      </CountDispatchContext.Provider>
    </CountStateContext.Provider>
  );
}

export function useCount() {
  const ctx = useContext(CountStateContext);
  if (ctx === null) throw new Error("useCount must be inside CounterProvider");
  return ctx;
}

export function useCountDispatch() {
  const ctx = useContext(CountDispatchContext);
  if (ctx === null) throw new Error("useCountDispatch must be inside CounterProvider");
  return ctx;
}`}</code></pre>
        <p>
          Now the wins line up cleanly:
        </p>
        <ul>
          <li>A component that <strong>displays</strong>{" "}the count calls <code>useCount()</code>{" "}and re-renders when the count changes. Correct — it needs the new number.</li>
          <li>A component that only <strong>changes</strong>{" "}the count calls <code>useCountDispatch()</code>. Its context value is <code>dispatch</code>, whose identity never changes, so it never re-renders on a count change. The increment button can sit in a busy list updating a thousand times and not repaint once.</li>
        </ul>
        <Callout variant="insight" title="Why dispatch is free to broadcast">
          <code>useReducer</code>&apos;s <code>dispatch</code>{" "}(and <code>useState</code>&apos;s setter) are <strong>guaranteed stable</strong>{" "}by React across the component&apos;s entire lifetime. You never need to memoize them, and a context that carries <em>only</em>{" "}a stable function will never trigger a consumer re-render. The dispatch channel is permanently quiet by construction.
        </Callout>
        <Callout variant="info" title="The pattern, generalized">
          The split-context pattern is: <em>put the things that change often in one context, and the things that almost never change in another.</em>{" "}State (chatty) goes one way; actions/setters/dispatch (quiet) go the other. Components subscribe to only the channel they actually depend on, so a change in one doesn&apos;t wake up consumers of the other.
        </Callout>
        <p>
          You can take this further and split chatty state itself — a separate context per slice of state — so a component reading <code>theme</code>{" "}doesn&apos;t re-render when <code>locale</code>{" "}changes. The tradeoff is more Providers and more wiring. Split when you can measure a real re-render problem; don&apos;t pre-emptively shatter every value into ten contexts on day one.
        </p>
      </section>

      <section>
        <h2>When context is the wrong tool</h2>
        <p>
          We&apos;ve made context fast and tidy. But the most senior move is knowing when to <em>not</em>{" "}use it at all. Two cases recur:
        </p>
        <p>
          <strong>High-frequency updates.</strong>{" "}Even a perfectly split, perfectly memoized context re-renders all of <em>that channel&apos;s</em>{" "}consumers on every change. If the value changes many times per second — pointer position, scroll, a dragging gesture, an animation value — that&apos;s a flood no amount of memoization fixes, because the value genuinely <em>is</em>{" "}changing each time. For those, keep the value in a <code>ref</code>{" "}and imperatively poke the one DOM node that cares, or use an external store with selector-based subscriptions so only the truly-interested component updates. (We&apos;ll meet <code>useRef</code>{" "}for exactly this in the next module.)
        </p>
        <p>
          <strong>Server state and caches.</strong>{" "}Context has no concept of fetching, caching, deduping requests, retrying, or knowing when data is stale. If your &quot;global value&quot;{" "}is really &quot;data that lives on a server,&quot;{" "}context is a leaky bucket — you&apos;ll end up reimplementing a cache badly inside a Provider. Dedicated server-cache tools own that lifecycle. We draw the bright line between <em>server state</em>{" "}and <em>client state</em>{" "}in Phase 5, and it&apos;s one of the highest-leverage distinctions in modern React.
        </p>
        <Callout variant="spring" title="If you're coming from Spring / backend DI">
          Context will feel like dependency injection — a value provided high in the tree and resolved by descendants, much like a bean injected by the container. The mental shift: a Spring bean is typically a long-lived singleton wired once at startup. A React context value is re-evaluated on <em>every render of the Provider</em>, and changing it re-renders consumers. So &quot;inject a config object&quot;{" "}maps cleanly; &quot;inject a rapidly-mutating request-scoped value&quot;{" "}does not — that&apos;s where the re-render cost bites and you&apos;d reach for a ref or a store instead.
        </Callout>
        <Callout variant="info" title="Looking ahead">
          Phase 5 is where the &quot;is this server state?&quot;{" "}question gets a real answer, and where we use refs and stores for the high-frequency cases context can&apos;t serve. For now, hold the boundary: context is for slow-changing, client-side, app-wide values — and it&apos;s for <em>transport</em>, not for owning the data&apos;s lifecycle.
        </Callout>

        <Checkpoint id="cp-splitting-and-limits" moduleSlug={MODULE_SLUG} title="Splitting contexts + when context is the wrong tool">
          <Quiz
            kind="Quick check"
            question="You split a counter into a state context and a dispatch context. A button consumes ONLY the dispatch context. The count increments 50 times. How many times does the button re-render from those increments?"
            options={[
              { label: "50 times — every count change re-renders all consumers under the provider", explanation: "That would be true with a single combined context. By splitting, the button only subscribes to the dispatch channel." },
              { label: "Zero times — dispatch identity is stable, so the dispatch context's value never changes", correct: true, explanation: "Exactly. useReducer's dispatch is guaranteed stable for the component's life, so the dispatch context value never changes identity and dispatch-only consumers never re-render on state changes." },
              { label: "Once, on the first increment, then never again", explanation: "It doesn't re-render at all from the increments — the dispatch reference is stable from the very first render, so even the first increment doesn't touch it." },
              { label: "25 times — React batches every other update", explanation: "Batching changes how many renders the COUNT does, not whether a stable-value context wakes its consumers. A stable dispatch context wakes them zero times regardless of batching." },
            ]}
          />
          <Quiz
            kind="Judgment"
            question="Your design needs to share the live scroll position (updating ~60x/sec) with several deep components. A teammate suggests putting it in a well-memoized context. What's the issue?"
            options={[
              { label: "No issue — memoization makes context fast enough for anything", explanation: "Memoization stabilizes identity only when the VALUE is unchanged. A scroll position genuinely changes every frame, so the value really is new each time and every consumer re-renders ~60x/sec." },
              { label: "The value genuinely changes every frame, so every consumer re-renders ~60x/sec — context is the wrong tool for high-frequency state", correct: true, explanation: "Right. Memoization can't help when the contents truly change each tick. Reach for a ref to poke the specific DOM node, or an external store with selector subscriptions so only the interested component updates." },
              { label: "Context can't store numbers, only objects", explanation: "Context can store any value, including numbers. The problem is the update frequency, not the type." },
              { label: "You'd need useState instead of useReducer for scroll values", explanation: "The state hook choice is irrelevant here; the fundamental problem is broadcasting a 60Hz value to many consumers through context at all." },
            ]}
          />
        </Checkpoint>
      </section>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li><strong>What it&apos;s for:</strong>{" "}delivering a slow-changing, app-wide value (theme, current user, locale, a configured client) to deep consumers without prop drilling. It&apos;s <em>transport</em>, not a state manager.</li>
          <li><strong>The three parts:</strong>{" "}<code>createContext(default)</code>{" "}→ <code>{"<Ctx.Provider value={...}>"}</code>{" "}→ <code>useContext(Ctx)</code>, usually wrapped in a custom <code>useThing()</code>{" "}hook with a Provider-present check.</li>
          <li><strong>The re-render rule:</strong>{" "}when the Provider&apos;s <code>value</code>{" "}changes by <code>Object.is</code>, <em>every</em>{" "}consumer re-renders — regardless of which field it reads.</li>
          <li><strong>The trap:</strong>{" "}<code>value={"{{ a, b }}"}</code>{" "}makes a new object every render, so consumers re-render even when nothing meaningfully changed. Fix with <code>useMemo</code> (and <code>useCallback</code>{" "}for any functions inside it).</li>
          <li><strong>The pro move:</strong>{" "}split state and dispatch into two contexts. State is chatty; <code>dispatch</code>/setters are referentially stable, so dispatch-only consumers never re-render on state changes.</li>
          <li><strong>When NOT to use it:</strong>{" "}high-frequency values (use a ref or external store) and server data/caches (use Phase 5&apos;s dedicated tools). And don&apos;t reach for it to dodge a single prop.</li>
        </ul>
      </section>

      <section>
        <h2>The project: build it, break it, fix it</h2>
        <p>
          Time to feel the storm and then quiet it. Build this in a fresh component file. Aim to <em>observe</em>{" "}the re-renders, not just read about them.
        </p>
        <ol>
          <li>
            <strong>Build a basic <code>ThemeProvider</code>{" "}+ <code>useTheme</code>.</strong>{" "}Create a context with a <code>{"{ theme, toggle }"}</code>{" "}value, a Provider holding <code>theme</code>{" "}in <code>useState</code>, and a <code>useTheme</code>{" "}custom hook that throws if used outside the Provider. Render a button somewhere deep that calls <code>toggle</code>{" "}and shows the current theme. Confirm it works.
          </li>
          <li>
            <strong>Add a re-render counter.</strong>{" "}In a separate consumer component (say a <code>ThemedLabel</code>{" "}that only <em>reads</em> <code>theme</code>), drop a <code>console.log(&quot;ThemedLabel render&quot;)</code>{" "}or increment a <code>useRef</code>{" "}counter and display it. This is your instrument for seeing renders.
          </li>
          <li>
            <strong>Prove the problem.</strong>{" "}Add an <em>unrelated</em>{" "}piece of state to the Provider — a <code>tick</code>{" "}counter with a button that increments it — and pass <code>value={"{{ theme, toggle }}"}</code>{" "}as a raw object literal. Click the tick button. Watch <code>ThemedLabel</code>{" "}re-render on every tick even though the theme never changed. That&apos;s the new-object-every-render trap, live.
          </li>
          <li>
            <strong>Fix the identity.</strong>{" "}Wrap <code>toggle</code>{" "}in <code>useCallback</code>{" "}and the value object in <code>useMemo(() =&gt; ({"{ theme, toggle }"}), [theme, toggle])</code>. Click the tick button again. <code>ThemedLabel</code>{" "}should now stay quiet on ticks and only re-render when you actually toggle the theme. Storm calmed.
          </li>
          <li>
            <strong>Split state and dispatch.</strong>{" "}Refactor to <code>useReducer</code>{" "}and two contexts: a <code>ThemeStateContext</code>{" "}(carries <code>theme</code>) and a <code>ThemeDispatchContext</code>{" "}(carries <code>dispatch</code>). Give each its own hook. Make the toggle button consume <em>only</em>{" "}the dispatch context.
          </li>
          <li>
            <strong>Prove the final win.</strong>{" "}Put a render counter in the toggle button too. Now toggle the theme repeatedly: the <code>ThemedLabel</code>{" "}(state consumer) re-renders each time, but the toggle button (dispatch-only consumer) <em>never</em>{" "}re-renders from theme changes — its context value, <code>dispatch</code>, is referentially stable. Two channels, each component listening only to the one it needs.
          </li>
        </ol>
        <Callout variant="spring" title="Stretch goal">
          Add a second, fast-changing value (a number that increments on a timer) and try shoving it through the same context. Watch your render counters explode. Then move it out of context entirely — into local state in the one component that displays it — and watch the counts drop. That contrast is the &quot;when context is the wrong tool&quot;{" "}lesson burned into muscle memory.
        </Callout>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
