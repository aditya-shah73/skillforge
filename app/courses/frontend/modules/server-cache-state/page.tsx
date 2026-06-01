import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "server-cache-state";

const CHECKPOINTS = [
  { id: "cp-cache-not-state", title: "Server data is a cache, not state you own" },
  { id: "cp-querykey-staleness", title: "The `queryKey` model + staleness & invalidation" },
  { id: "cp-optimistic-mutations", title: "Mutations, optimistic updates, and rollback" },
];

export default function ServerCacheStateModule() {
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
          Server cache is not client state — the React Query mental model
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Almost every painful <code>useEffect</code>{" "}fetch you&apos;ve ever written comes from one category error: treating a <em>copy</em>{" "}of someone else&apos;s data like state you own. Fix the category, and the loading flags, race conditions, and double-fetches mostly dissolve.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy — a photocopy of a document that lives elsewhere</h2>
        <p>
          A colleague keeps the master copy of a contract in their office. You walk over, photocopy it, and bring the copy back to your desk. Now you can read it instantly — no walk required. But the moment you sit down, your copy starts going <em>stale</em>: the master might be edited at any time, and your photocopy won&apos;t know.
        </p>
        <p>
          That is exactly what server data is on the client. The server owns the master. Your component holds a photocopy. You don&apos;t <em>own</em>{" "}that data — you hold a possibly-stale snapshot of something that lives somewhere else and can change without telling you.
        </p>
        <p>
          The root mistake is treating that photocopy like state you authored: dropping it into <code>useState</code>, manually deciding when to re-walk-to-the-office, and pretending your copy is the source of truth. It isn&apos;t. It&apos;s a cache.
        </p>
        <Callout variant="insight" title="The one-line definition">
          Server state is a <strong>cache</strong>{" "}of data the server owns — not state you own. <code>useState</code>{" "}is for data you authored and control. The two have fundamentally different needs.
        </Callout>
      </section>

      <section>
        <h2>The category error — client state vs server state</h2>
        <p>
          Two things that both happen to be &quot;data in a React component&quot;{" "}are actually different categories, and conflating them is where the pain starts.
        </p>
        <ul>
          <li><strong>Client state</strong>{" "}— a modal&apos;s open/closed flag, the current tab, an in-progress form value, a selected filter. <em>You</em>{" "}own it. It&apos;s the source of truth. It&apos;s synchronous, it never goes stale behind your back, and nobody else can change it. <code>useState</code>/<code>useReducer</code>{" "}is exactly right for this.</li>
          <li><strong>Server state</strong>{" "}— the list of todos, the current user, a product&apos;s price. The <em>server</em>{" "}owns it. What you hold is a cached copy. It&apos;s asynchronous to fetch, it can be stale the instant it arrives, it can be shared by many components, and it can change on the server while you&apos;re looking at your copy.</li>
        </ul>
        <p>
          When you store server data in <code>useState</code>{" "}and fetch it in <code>useEffect</code>, you&apos;re forcing a cache to behave like owned state. You end up hand-writing everything a cache needs — and it&apos;s tedious and bug-prone:
        </p>
        <pre><code>{`function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;          // race-condition guard you must remember
    setLoading(true);
    fetch("/api/todos")
      .then(r => r.json())
      .then(data => { if (!cancelled) { setTodos(data); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);                            // [] means: never refetch. Stale forever.

  // No caching across mounts. No dedup. No background refresh.
  // No retry. Every component that needs todos refetches them.
}`}</code></pre>
        <Callout variant="warn" title="The tell-tale sign">
          If you find yourself hand-rolling <code>loading</code>, <code>error</code>, a cancellation flag, and a &quot;should I refetch?&quot;{" "}decision for data that came from the network, you&apos;re reimplementing a cache by hand. That&apos;s the signal to reach for a server-cache tool.
        </Callout>
      </section>

      <section>
        <h2>What a server-cache tool gives you that <code>useState</code>{" "}+ <code>useEffect</code>{" "}can&apos;t</h2>
        <p>
          This is the <em>why</em>{" "}for the entire module. A tool like TanStack Query (React Query) isn&apos;t &quot;a nicer fetch wrapper.&quot;{" "}It&apos;s a cache with a policy engine attached. Out of the box it gives you:
        </p>
        <ul>
          <li><strong>Caching across mounts.</strong>{" "}Navigate away and back, and the data is already there — shown instantly while a fresh copy loads in the background.</li>
          <li><strong>Request deduplication.</strong>{" "}If three components ask for the same key at the same time, exactly <em>one</em>{" "}network request fires. They all share the result.</li>
          <li><strong>A staleness model.</strong>{" "}You declare how long a copy stays &quot;fresh&quot;{" "}(<code>staleTime</code>); after that it&apos;s eligible to be refetched. You stop guessing.</li>
          <li><strong>Automatic background refetching.</strong>{" "}On window refocus, on reconnect, on interval — your photocopy quietly re-syncs with the master without a spinner.</li>
          <li><strong>Retries with backoff.</strong>{" "}Transient failures retry automatically instead of becoming an error a user sees.</li>
          <li><strong>A normalized <code>{`{ data, isPending, isError, ... }`}</code>{" "}shape.</strong>{" "}Every query reports its state the same way, so your components stop reinventing the loading/error dance.</li>
        </ul>
        <p>
          You declare what you want; the cache decides when to fetch, when to dedup, when to refresh, and how to retry. That policy work is the part you were doing by hand — badly — in every <code>useEffect</code>.
        </p>
        <Callout variant="info" title="Not just React Query">
          TanStack Query is the most common answer, but the category is bigger: SWR, Apollo Client (for GraphQL), and RTK Query all solve the same problem. They&apos;re all <em>server-cache</em>{" "}libraries. The mental model in this module transfers to all of them.
        </Callout>
      </section>

      <Checkpoint id="cp-cache-not-state" moduleSlug={MODULE_SLUG} title="Server data is a cache, not state you own">
        <Quiz
          kind="Quick check"
          question="Which of these is genuinely *client* state (data you own, the source of truth)?"
          options={[
            { label: "The list of products returned by `GET /api/products`.", explanation: "Wrong — the server owns the products. What you hold is a cached copy that can go stale. That's server state." },
            { label: "Whether a dropdown menu is currently open.", correct: true, explanation: "Right — you authored it, it's synchronous, nobody else can change it, and it never goes stale behind your back. Classic `useState` client state." },
            { label: "The currently logged-in user's profile from the API.", explanation: "Wrong — the profile lives on the server; your copy is a cache. It can change server-side (e.g., the user edits it on another device)." },
            { label: "The unread-notifications count fetched from the backend.", explanation: "Wrong — that count is owned by the server and changes independently of your tab. It's server state you're caching." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="A teammate fetches data in `useEffect`, stores it in `useState`, and hand-writes `loading`, `error`, and a `cancelled` flag — for every screen. What's the underlying problem?"
          options={[
            { label: "They forgot to wrap the fetch in `useCallback`.", explanation: "Wrong — `useCallback` wouldn't change anything here. The problem is categorical, not a memoization detail." },
            { label: "They're treating a cache (server data) like owned state, so they're reimplementing caching, dedup, staleness, and retry by hand each time.", correct: true, explanation: "Right — that's the category error. A server-cache tool provides all of that as policy, so the per-screen boilerplate disappears." },
            { label: "They should move the fetch into a Redux reducer.", explanation: "Wrong — Redux is a client-state store; putting raw server data in it just relocates the same hand-rolled caching problem. RTK Query (a server-cache layer) would help, plain Redux wouldn't." },
            { label: "Nothing — that's the idiomatic React way to fetch.", explanation: "Wrong — it works for trivial cases but doesn't dedup, cache across mounts, or refresh in the background. The pain scales with the app." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The <code>queryKey</code>{" "}model — the key <em>is</em>{" "}the cache identity</h2>
        <p>
          The single most important idea in React Query: every cache entry is identified by a <code>queryKey</code>. The key isn&apos;t a label — it&apos;s the address of the data in the cache. Same key, same cache entry. Different key, different entry.
        </p>
        <pre><code>{`import { useQuery } from "@tanstack/react-query";

function useTodos() {
  return useQuery({
    queryKey: ["todos"],                 // identity of this cache entry
    queryFn: () => fetch("/api/todos").then(r => r.json()),
  });
}

function useTodo(id) {
  return useQuery({
    queryKey: ["todo", id],              // a different entry per id
    queryFn: () => fetch(\`/api/todos/\${id}\`).then(r => r.json()),
  });
}`}</code></pre>
        <p>
          Three consequences fall straight out of &quot;the key is the identity&quot;:
        </p>
        <ul>
          <li><strong>Dedup is automatic.</strong>{" "}If two components both call <code>useTodos()</code>, they share <code>[&quot;todos&quot;]</code>{" "}— one fetch, one cached result, both render it.</li>
          <li><strong>Keys are structural, not referential.</strong>{" "}<code>[&quot;todo&quot;, 7]</code>{" "}equals <code>[&quot;todo&quot;, 7]</code>{" "}even across renders — React Query compares the key by value (a deep/structural compare), so you don&apos;t need to memoize it.</li>
          <li><strong>Changing the key triggers a refetch.</strong>{" "}When <code>id</code>{" "}goes from <code>7</code>{" "}to <code>8</code>, the key becomes <code>[&quot;todo&quot;, 8]</code>{" "}— a different entry, so the query fetches the new todo. This is how you make a query reactive to inputs: put the input <em>in the key</em>.</li>
        </ul>
        <pre><code>{`function TodoDetail({ id }) {
  const { data, isPending, isError, error } = useTodo(id);

  if (isPending) return <Spinner />;     // normalized states — no manual flags
  if (isError) return <p>{error.message}</p>;
  return <h1>{data.title}</h1>;
}`}</code></pre>
        <Callout variant="insight" title="Put every input that affects the data in the key">
          A filter, a page number, a search term, a user id — if changing it should fetch different data, it belongs in the <code>queryKey</code>. The key is both the cache address <em>and</em>{" "}the dependency array for refetching. Get the key right and most &quot;why isn&apos;t it refetching?&quot;{" "}bugs vanish.
        </Callout>
      </section>

      <section>
        <h2>Staleness &amp; invalidation — fresh, stale, and how a copy gets refreshed</h2>
        <p>
          Back to the photocopy. The cache tracks how old your copy is and decides when to re-sync. Two timers govern this:
        </p>
        <ul>
          <li><strong><code>staleTime</code></strong>{" "}— how long a freshly fetched copy is considered <em>fresh</em>. While fresh, React Query serves it without refetching, even on remount or refocus. Default is <code>0</code>{" "}— data is considered stale immediately, so it&apos;ll refetch on the next trigger. Bump it (e.g. <code>staleTime: 60_000</code>) for data that doesn&apos;t change every second.</li>
          <li><strong><code>gcTime</code></strong>{" "}(garbage-collection time, formerly <code>cacheTime</code>) — how long an <em>unused</em>{" "}cache entry sticks around after the last component using it unmounts. Default 5 minutes. It&apos;s about memory cleanup, not freshness.</li>
        </ul>
        <p>
          The lifecycle of a copy: <strong>fresh</strong>{" "}(within <code>staleTime</code>, served as-is) → <strong>stale</strong>{" "}(past <code>staleTime</code>, still shown but eligible to refetch) → a trigger (refocus, remount, reconnect, or explicit invalidation) fires a <strong>background refetch</strong>{" "}→ fresh again. Crucially, stale data is still rendered while the refetch runs — no spinner flash, no blank screen.
        </p>
        <p>
          When <em>you</em>{" "}know the master changed — for example, you just created a todo — you tell the cache its copy is stale and should refetch:
        </p>
        <pre><code>{`import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// Mark every entry whose key starts with ["todos"] as stale and refetch:
queryClient.invalidateQueries({ queryKey: ["todos"] });`}</code></pre>
        <p>
          <code>invalidateQueries</code>{" "}matches by key <em>prefix</em>{" "}— invalidating <code>[&quot;todos&quot;]</code>{" "}also invalidates <code>[&quot;todos&quot;, &#123; status: &quot;done&quot; &#125;]</code>{" "}and friends. This is the standard &quot;I changed the data, refresh whatever depends on it&quot;{" "}move.
        </p>
        <Callout variant="warn" title="staleTime vs gcTime — don't mix them up">
          <code>staleTime</code>{" "}answers &quot;is my copy fresh enough to skip a refetch?&quot;{" "}<code>gcTime</code>{" "}answers &quot;how long do I keep this copy in memory after nobody&apos;s using it?&quot;{" "}A common interview trip-up: setting <code>gcTime</code>{" "}high expecting it to stop refetching. It won&apos;t — that&apos;s <code>staleTime</code>&apos;s job.
        </Callout>
      </section>

      <Checkpoint id="cp-querykey-staleness" moduleSlug={MODULE_SLUG} title="The `queryKey` model + staleness & invalidation">
        <Quiz
          kind="Scenario"
          question="You have `useQuery({ queryKey: ['todo', id], queryFn: () => fetchTodo(id) })`. The user navigates from todo 7 to todo 8 but the screen keeps showing todo 7's data. What's the most likely cause?"
          options={[
            { label: "`id` isn't in the `queryKey` (e.g. the key is hardcoded `['todo']`), so the cache identity never changes.", correct: true, explanation: "Right — if `id` isn't part of the key, both todos map to the same cache entry, so no refetch is triggered when `id` changes. The key is the dependency that drives refetching." },
            { label: "`staleTime` is too low, so it's serving cached data.", explanation: "Wrong — a low `staleTime` would cause *more* refetching, not less. And a different key would be a different entry regardless of staleTime." },
            { label: "You forgot to call `invalidateQueries`.", explanation: "Wrong — you shouldn't need to invalidate on a route change. Putting `id` in the key makes the query reactive to it automatically." },
            { label: "`gcTime` is holding onto the old data.", explanation: "Wrong — `gcTime` governs memory cleanup of unused entries, not which entry a query reads. The issue is the key, not gc." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question="What does `staleTime` control?"
          options={[
            { label: "How long an unused cache entry stays in memory before being garbage-collected.", explanation: "Wrong — that's `gcTime`. It's about memory, not freshness." },
            { label: "How long a fetched copy is considered fresh, during which React Query will serve it without refetching.", correct: true, explanation: "Right — within `staleTime`, the cached copy is served as-is even on remount/refocus. After it, the copy is stale and eligible for a background refetch on the next trigger." },
            { label: "The delay between automatic retries after a failed request.", explanation: "Wrong — retry timing is configured separately (`retry`/`retryDelay`). `staleTime` is about freshness of successful data." },
            { label: "How often the query polls the server on an interval.", explanation: "Wrong — interval polling is `refetchInterval`. `staleTime` doesn't poll; it decides when an existing copy counts as stale." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Mutations + optimistic updates</h2>
        <p>
          Reads use <code>useQuery</code>. Writes (create/update/delete) use <code>useMutation</code>. A mutation runs a function and then, typically, invalidates the queries it affected so they refetch the new truth:
        </p>
        <pre><code>{`import { useMutation, useQueryClient } from "@tanstack/react-query";

function useAddTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text) =>
      fetch("/api/todos", { method: "POST", body: JSON.stringify({ text }) })
        .then(r => r.json()),
    onSuccess: () => {
      // The master changed — mark our copy stale and refetch.
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}`}</code></pre>
        <p>
          That works, but there&apos;s a round-trip of latency before the UI updates. An <strong>optimistic update</strong>{" "}makes the UI feel instant: you write the expected result into the cache <em>immediately</em>, before the server confirms — and roll back if the request fails.
        </p>
        <p>
          The pattern uses three mutation lifecycle callbacks:
        </p>
        <ul>
          <li><strong><code>onMutate</code></strong>{" "}— fires before the request. Cancel in-flight refetches, snapshot the current cache (for rollback), and write the optimistic value.</li>
          <li><strong><code>onError</code></strong>{" "}— the request failed; restore the snapshot you took in <code>onMutate</code>.</li>
          <li><strong><code>onSettled</code></strong>{" "}— runs whether it succeeded or failed; invalidate so the cache re-syncs with the real server truth.</li>
        </ul>
        <pre><code>{`function useAddTodoOptimistic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text) => api.addTodo(text),

    onMutate: async (text) => {
      // 1. Stop refetches that could overwrite our optimistic write.
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // 2. Snapshot the current cache so we can roll back.
      const previous = queryClient.getQueryData(["todos"]);

      // 3. Optimistically write the expected result.
      queryClient.setQueryData(["todos"], (old = []) => [
        ...old,
        { id: "temp-" + Date.now(), text, pending: true },
      ]);

      // 4. Pass the snapshot to onError via the context.
      return { previous };
    },

    onError: (_err, _text, context) => {
      // Roll back to the snapshot.
      queryClient.setQueryData(["todos"], context.previous);
    },

    onSettled: () => {
      // Success or failure: reconcile with the server's real data.
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}`}</code></pre>
        <Callout variant="insight" title="Why snapshot-and-rollback, not just 'set it back'">
          You can&apos;t reconstruct the previous state by reversing your change — another mutation or background refetch might have touched the cache meanwhile. Capturing the exact <code>previous</code>{" "}value in <code>onMutate</code>{" "}and restoring <em>that</em>{" "}in <code>onError</code>{" "}is the only reliable rollback. And <code>cancelQueries</code>{" "}first, so an in-flight refetch can&apos;t clobber your optimistic write mid-flight.
        </Callout>
      </section>

      <section>
        <h2>When you <em>don&apos;t</em>{" "}need a server-cache tool</h2>
        <p>
          The category matters here too. Reach for the tool when you&apos;re caching server data with real needs (dedup, staleness, background refresh). Don&apos;t reach for it when:
        </p>
        <ul>
          <li><strong>It&apos;s purely local UI state.</strong>{" "}A toggle, a wizard step, a form&apos;s in-progress values — that&apos;s client state. <code>useState</code>/<code>useReducer</code>{" "}(or a small store) is correct. Wrapping it in a query cache is nonsense.</li>
          <li><strong>The framework already owns the fetch.</strong>{" "}In Next.js App Router, a <em>Server Component</em>{" "}can <code>await</code>{" "}data on the server and stream HTML — no client cache needed for that read at all. Route loaders (Remix/React Router) and server <code>fetch</code>{" "}with Next&apos;s built-in caching solve the same &quot;where does server data come from?&quot;{" "}problem one layer up.</li>
        </ul>
        <pre><code>{`// Next.js Server Component — the fetch happens on the server, at request time.
// No useQuery, no useEffect, no client-side loading flag for this read.
export default async function TodosPage() {
  const todos = await fetch("https://api.example.com/todos", {
    next: { revalidate: 60 },   // Next's own staleness model
  }).then(r => r.json());

  return <TodoList todos={todos} />;
}`}</code></pre>
        <Callout variant="info" title="Two answers to the same question">
          &quot;How do I get server data into the UI without hand-rolling a cache?&quot;{" "}has two modern answers: a client-side server-cache library (React Query) <em>or</em>{" "}server-side data loading (RSC / route loaders). Many apps use both — RSC for the initial render, React Query for client-side interactivity, mutations, and background refresh. They&apos;re complements, not rivals.
        </Callout>
      </section>

      <Checkpoint id="cp-optimistic-mutations" moduleSlug={MODULE_SLUG} title="Mutations, optimistic updates, and rollback">
        <Quiz
          kind="Scenario"
          question="In an optimistic `useMutation`, why does `onMutate` snapshot the cache with `getQueryData` before writing the optimistic value?"
          options={[
            { label: "To give `onError` an exact previous value to restore, since you can't reliably reverse the change later.", correct: true, explanation: "Right — you capture `previous` in `onMutate` and return it; `onError` restores it. Reversing the edit by hand is unsafe because other mutations/refetches may have touched the cache." },
            { label: "Because `setQueryData` throws if there's no prior snapshot.", explanation: "Wrong — `setQueryData` doesn't require a snapshot. The snapshot exists purely so rollback is possible." },
            { label: "To dedupe the request with other in-flight mutations.", explanation: "Wrong — dedup is a query (read) concern keyed by `queryKey`; it's not what the snapshot does. The snapshot is for rollback." },
            { label: "So React Query can diff old vs new and animate the change.", explanation: "Wrong — React Query doesn't animate cache changes. The snapshot's only job is enabling a clean rollback on error." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question="After a successful create mutation, what's the standard way to make the todo list reflect the new item from the server's perspective?"
          options={[
            { label: "Manually `setItems([...items, newItem])` in component state.", explanation: "Wrong — that reintroduces hand-managed server state in `useState`, the exact anti-pattern this module is about. The cache, not component state, owns the list." },
            { label: "Call `queryClient.invalidateQueries({ queryKey: ['todos'] })` (typically in `onSuccess`/`onSettled`) to mark it stale and refetch.", correct: true, explanation: "Right — invalidation tells the cache its copy is out of date so it refetches the authoritative list. (For an instant feel you'd also write optimistically in `onMutate`.)" },
            { label: "Lower `staleTime` to 0 globally so everything refetches.", explanation: "Wrong — that's a blunt, app-wide hammer that causes excessive refetching. Targeted `invalidateQueries` refreshes only what changed." },
            { label: "Reload the page.", explanation: "Wrong — that throws away the whole client cache and every other piece of fresh state. Invalidation refreshes just the affected queries." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li><strong>Server state is a cache, not state you own.</strong>{" "}It&apos;s a possibly-stale photocopy of data the server owns — not a value you authored. That single reframe is the whole module.</li>
          <li><strong>Client state</strong>{" "}(toggles, form values) you own and is the source of truth → <code>useState</code>. <strong>Server state</strong>{" "}you cache → a server-cache tool.</li>
          <li>Hand-rolled <code>useEffect</code>{" "}fetching is painful because you end up reimplementing caching, dedup, staleness, retry, and loading/error shape by hand.</li>
          <li>A tool like React Query gives you all of that: caching across mounts, request <strong>dedup</strong>{" "}per <code>queryKey</code>, a <strong>staleness</strong>{" "}model (<code>staleTime</code>), background refetch, retries, and a normalized <code>{`{ data, isPending, isError }`}</code>{" "}shape.</li>
          <li>The <code>queryKey</code>{" "}<strong>is</strong>{" "}the cache identity. Same key = same entry = dedup + shared data. Put every input that affects the data in the key; changing the key refetches.</li>
          <li>After a write, <code>invalidateQueries</code>{" "}marks the affected copies stale so they refetch the new truth.</li>
          <li><strong>Optimistic updates</strong>: <code>onMutate</code>{" "}snapshots + writes the expected value, <code>onError</code>{" "}rolls back to the snapshot, <code>onSettled</code>{" "}invalidates to reconcile.</li>
          <li>You don&apos;t need it for purely local UI state, or when a Server Component / route loader already owns the fetch.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <p>
          Take a screen that currently hand-rolls fetch + cache with <code>useState</code>{" "}+ <code>useEffect</code>{" "}(the <code>TodoList</code>{" "}from earlier is perfect) and migrate it to TanStack Query. In a real project you&apos;d start with <code>npm i @tanstack/react-query</code>{" "}and wrap your tree in a <code>{`<QueryClientProvider>`}</code>.
        </p>
        <ol>
          <li>Replace the <code>useEffect</code>{" "}fetch with <code>useQuery({"{"}{" "}queryKey: [&quot;todos&quot;], queryFn{" "}{"}"})</code>. Delete the manual <code>loading</code>/<code>error</code>/<code>cancelled</code>{" "}state and render off <code>isPending</code>/<code>isError</code>/<code>data</code>{" "}instead.</li>
          <li>Add a detail view with <code>useQuery({"{"}{" "}queryKey: [&quot;todo&quot;, id]{" "}{"}"})</code>. Navigate between ids and confirm it refetches automatically <em>because the key changed</em>{" "}— no effect, no manual refetch.</li>
          <li>Mount the list in two places at once and watch the network tab: confirm <strong>one</strong>{" "}request, not two (dedup via the shared <code>[&quot;todos&quot;]</code>{" "}key).</li>
          <li>Add a create action with <code>useMutation</code>. In <code>onSuccess</code>, call <code>queryClient.invalidateQueries({"{"}{" "}queryKey: [&quot;todos&quot;]{" "}{"}"})</code>{" "}and confirm the list refreshes with the new item.</li>
          <li>Upgrade that mutation to <strong>optimistic</strong>: in <code>onMutate</code>{" "}cancel queries, snapshot with <code>getQueryData</code>, write the expected item with <code>setQueryData</code>; roll back in <code>onError</code>; invalidate in <code>onSettled</code>. Throttle the API and confirm the item appears instantly, then reconciles.</li>
          <li><em>Stretch:</em>{" "}set <code>staleTime: 30_000</code>{" "}on the list query, remount it within 30s, and confirm it serves cached data with no network request — then refocus the window after it&apos;s stale and watch the background refetch.</li>
        </ol>
        <p>
          You should be able to explain — out loud — why server data is a cache and not state you own, why the <code>queryKey</code>{" "}is the cache identity that drives dedup and refetching, and how an optimistic update snapshots, writes, rolls back, and reconciles.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
