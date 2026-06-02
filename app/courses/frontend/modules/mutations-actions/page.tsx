import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "mutations-actions";

const CHECKPOINTS = [
  { id: "cp-what-is-an-action", title: "What a Server Action is (and progressive enhancement)" },
  { id: "cp-revalidate-pending", title: "Revalidation + pending/error UI" },
  { id: "cp-optimistic-vs-route", title: "Optimistic UI & Action vs Route Handler" },
];

export default function MutationsActionsModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 7 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Server Actions &amp; mutations, forms without an API layer
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          You spent the last few modules learning to <em>read</em>{" "}server data. Now you need to <em>change</em>{" "}it, create a todo, edit a profile, delete a row. The reflex is &quot;write a <code>POST /api</code>{" "}route, then <code>fetch</code>{" "}it from a click handler.&quot;{" "}The App Router has a shorter path: a function you call directly that runs on the server. Let&apos;s see what it actually is, and why the resulting form works even with JavaScript turned off.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The analogy, the order slip you hand to the kitchen</h2>
        <p className="mb-4">
          Think about how the classic way works. To change something on the server, you build a little postal system: you
          define an address (<code>POST /api/todos</code>), you write a handler that lives at that address, and from the
          client you address an envelope (<code>fetch</code>{" "}with a method, headers, and a JSON body), send it, then wait
          for a reply and figure out what to do with it. You maintain <em>both ends</em>{" "}of a wire and the protocol that
          runs over it, for every single mutation.
        </p>
        <p className="mb-4">
          A <strong>Server Action</strong>{" "}is a different shape entirely. Imagine sitting at a restaurant table and, instead
          of walking to the kitchen yourself, you fill in an order slip and hand it to the waiter. You wrote the order in the
          dining room; it gets <em>carried out</em>{" "}and executed in the kitchen. You never built a delivery route or addressed
          an envelope, you just called &quot;make this&quot;{" "}and the slip travelled to where the work happens.
        </p>
        <p className="mb-4">
          That is what <code>&quot;use server&quot;</code>{" "}does. You write a normal-looking async function in your code, mark it,
          and call it like any other function, but the framework knows that function&apos;s body must <em>run on the server</em>.
          Calling it from the browser doesn&apos;t run the code locally; it ships the call (the order slip) to the server, runs
          it there, and brings back the result. You no longer hand-build the wire. The framework <em>is</em>{" "}the waiter.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            The headline feature is &quot;mutations without writing an API route.&quot;{" "}But the deeper ideas are: a function can be
            a <em>server endpoint</em>{" "}you call like a function; a <code>&lt;form&gt;</code>{" "}can submit to one and work
            <em> without JavaScript</em>; and after a write you don&apos;t refetch by hand, you tell the framework to
            <em> revalidate</em>{" "}its server-rendered data. Everything below builds on those three.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. WHAT IS A SERVER ACTION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">What a Server Action actually is</h2>
        <p className="mb-4">
          A Server Action is an <code>async</code>{" "}function marked with the <code>&quot;use server&quot;</code>{" "}directive. That
          directive is a promise to the bundler: <em>this code only ever runs on the server, never ship it to the
          browser.</em>{" "}You can mark a single function with an inline directive, or mark a whole file so every export in it
          is an action:
        </p>
        <pre><code>{`// app/actions.ts  — every export here is a Server Action
"use server";

import { db } from "@/lib/db";

export async function createTodo(formData: FormData) {
  const text = formData.get("text");
  // ...runs on the server. Has direct DB access. Never sent to the client.
  await db.todo.create({ data: { text: String(text) } });
}`}</code></pre>
        <p className="mb-4">
          Or inline, defined right inside a Server Component, where the directive is the first line of the function body:
        </p>
        <pre><code>{`export default function NewTodoPage() {
  async function createTodo(formData: FormData) {
    "use server";                       // <- this function runs on the server
    const text = formData.get("text");
    await db.todo.create({ data: { text: String(text) } });
  }

  return (
    <form action={createTodo}>
      <input name="text" />
      <button type="submit">Add</button>
    </form>
  );
}`}</code></pre>
        <p className="mb-4">
          Look at what is <em>not</em>{" "}there: no <code>POST</code>{" "}route file, no <code>fetch</code>, no URL string, no
          <code> JSON.stringify</code>, no manually-set <code>Content-Type</code>. You attached the function straight to the
          form&apos;s <code>action</code>{" "}prop. When the form submits, the framework serializes the submission, calls the
          function on the server with the <code>FormData</code>, and runs its body there. The wire still exists, you just
          didn&apos;t hand-build it.
        </p>
        <Callout variant="warn" title="&quot;use server&quot; is not &quot;use client&quot;">
          <p>
            They sound like a matched pair; they are opposites in purpose. <code>&quot;use client&quot;</code>{" "}marks the boundary
            where a module&apos;s code is shipped to and runs in the <em>browser</em>. <code>&quot;use server&quot;</code>{" "}marks
            functions that run on the <em>server</em>{" "}and can be <em>called</em>{" "}from the client. A
            <code> &quot;use server&quot;</code>{" "}function is a server endpoint with a function-call interface, its body never
            reaches the browser, only the ability to invoke it does.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. PROGRESSIVE ENHANCEMENT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Progressive enhancement, the form works without JavaScript</h2>
        <p className="mb-4">
          Here is the part that feels like magic the first time. A <code>&lt;form action=&#123;serverAction&#125;&gt;</code>
          {" "}is a <em>real HTML form</em>. Before any JavaScript loads, or if JS is disabled, or if the bundle fails, or on
          a flaky connection mid-download, the browser can still submit that form the old-fashioned way: a native
          <code> POST</code>{" "}to the server, which runs your action and returns the next page. The feature works on a
          baseline of plain HTML.
        </p>
        <p className="mb-4">
          When JavaScript <em>is</em>{" "}available, React <strong>enhances</strong>{" "}the same form: it intercepts the submit,
          calls the action without a full-page navigation, and updates the UI in place. Same markup, same action, two modes,
          depending on what the browser can do right now. That is the literal definition of progressive enhancement, and you
          get it for free by attaching an action to a form instead of wiring an <code>onClick</code>{" "}+ <code>fetch</code>.
        </p>
        <pre><code>{`// This submits and mutates even if the JS bundle never loads.
// With JS, React intercepts it and updates without a full navigation.
<form action={createTodo}>
  <input name="text" required />
  <button type="submit">Add todo</button>
</form>`}</code></pre>
        <p className="mb-4">
          Contrast the old approach. <code>onClick=&#123;() =&gt; fetch(...)&#125;</code>{" "}does <em>nothing</em>{" "}until the
          JavaScript that defines the handler has downloaded, parsed, and hydrated. Click before then and the button is dead.
          A Server Action form has no such dead window: the HTML form is functional the instant it paints.
        </p>
        <Callout variant="insight" title="Why this matters beyond the demo">
          <p>
            &quot;Who turns off JavaScript?&quot;{" "}misses the point. The real wins are the <em>in-between</em>{" "}moments: the
            seconds before hydration on a slow phone, a half-loaded bundle, an interrupted deploy. Progressive enhancement
            means the core action, submitting the form, survives all of them. It&apos;s reliability, not a checkbox for
            zealots.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-what-is-an-action" moduleSlug={MODULE_SLUG} title="What a Server Action is (and progressive enhancement)">
        <Quiz
          kind="Core concept"
          question="What does the `&quot;use server&quot;` directive on an async function actually mean?"
          options={[
            {
              label: "This function runs on the server; the client can call it like a function, but its body is never shipped to the browser",
              correct: true,
              explanation:
                "Right. \"use server\" marks a Server Action: the body executes on the server, and the framework gives the client a way to invoke it. The implementation (DB access, secrets) stays server-side.",
            },
            {
              label: "It tells the bundler to ship this function to the browser so it can run client-side",
              explanation:
                "That's backwards, that describes \"use client\". \"use server\" keeps the function body on the server and only exposes the ability to call it.",
            },
            {
              label: "It registers a WebSocket connection between the client and server",
              explanation:
                "No WebSocket is involved. A Server Action is a server-run function invoked via a normal request the framework manages for you.",
            },
            {
              label: "It marks the function as a React component that renders on the server",
              explanation:
                "It's not a component. It's an async function (a mutation endpoint) you attach to a form action or call from an event, not something that renders UI.",
            },
          ]}
        />
        <Quiz
          kind="Progressive enhancement"
          question="Why does a `&lt;form action={serverAction}&gt;` keep working even before the JavaScript bundle has loaded?"
          options={[
            {
              label: "It's a real HTML form, so the browser can do a native POST to the server that runs the action, React enhances it once JS is available",
              correct: true,
              explanation:
                "Exactly. The baseline is plain HTML form submission (works with no JS). When JS loads, React intercepts the submit and updates in place without a full navigation. Same form, two modes.",
            },
            {
              label: "Next.js inlines the entire action body into the initial HTML so the browser can run it locally",
              explanation:
                "The action body never ships to the browser, that's the whole point of \"use server\". The form works because native HTML form submission doesn't need the action's JS at all.",
            },
            {
              label: "It doesn't, like any handler, it needs hydration before the button does anything",
              explanation:
                "That's true of an onClick+fetch button, not a form action. A form's native POST is functional the moment the HTML paints, before hydration.",
            },
            {
              label: "Service workers cache the action and replay it offline",
              explanation:
                "No service worker is involved. The resilience comes from the browser's built-in form submission, not from caching.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. REVALIDATION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">After a write, <em>revalidate</em>,{" "}don&apos;t hand-refetch</h2>
        <p className="mb-4">
          You created a todo on the server. The list on screen was rendered on the server too, from the data as it was
          <em> before</em>{" "}your write. So the new todo doesn&apos;t appear yet. In the client-fetching world your next move
          would be &quot;refetch the list and <code>setState</code>.&quot;{" "}In the App Router that&apos;s the wrong instinct,
          because the list isn&apos;t client state you own, it&apos;s server-rendered output the framework cached.
        </p>
        <p className="mb-4">
          Instead you tell the framework: <em>the data behind this path (or tag) just changed, throw away the cached render
          and rebuild it.</em>{" "}That&apos;s <code>revalidatePath</code>{" "}and <code>revalidateTag</code>, called from inside the
          action <em>after</em>{" "}the mutation:
        </p>
        <pre><code>{`"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";

export async function createTodo(formData: FormData) {
  await db.todo.create({ data: { text: String(formData.get("text")) } });

  // Option A: re-render everything that depends on this route's data.
  revalidatePath("/todos");

  // Option B: re-render everything tagged "todos", wherever it's used.
  revalidateTag("todos");
}`}</code></pre>
        <p className="mb-4">
          The difference is granularity. <code>revalidatePath</code>{" "}targets a <em>route</em>,{" "}&quot;rebuild what
          <code> /todos</code>{" "}renders.&quot;{" "}<code>revalidateTag</code>{" "}targets a <em>tag</em>{" "}you attached when you
          fetched the data (<code>fetch(url, &#123; next: &#123; tags: [&quot;todos&quot;] &#125; &#125;)</code>), so it refreshes
          every place that data appears regardless of which route shows it. Use a path when the change is local to one screen;
          use a tag when the same data is rendered in several places and you want them all to re-sync.
        </p>
        <p className="mb-4">
          The payoff: after revalidation, the server re-runs the affected render with fresh data and React reconciles the new
          output into the page. You never wrote a <code>fetch</code>, never touched a loading flag, never owned a copy of the
          list. The server owns the data; you just told it &quot;your cached version is out of date.&quot;
        </p>
        <Callout variant="insight" title="The mental model: invalidate, don't synchronize">
          <p>
            Hand-refetching means keeping a client copy in sync with the server by hand, exactly the &quot;server data is a
            cache, not state you own&quot;{" "}trap from the data modules. Revalidation flips it: the server-rendered data is the
            single source of truth, and your job after a write is simply to <em>mark it stale</em>. The framework rebuilds it.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. PENDING STATE: useFormStatus ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Pending state with <code>useFormStatus()</code></h2>
        <p className="mb-4">
          While the action runs there&apos;s a round-trip of latency, and a good UI says so: disable the button, show
          &quot;Saving…&quot;. The hook for this is <code>useFormStatus()</code>. It reports the pending state of the
          <em> nearest enclosing form</em>,{" "}so it must be called from a component <strong>rendered inside</strong>{" "}that
          form, not from the component that renders the <code>&lt;form&gt;</code>{" "}itself.
        </p>
        <pre><code>{`"use client";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();   // reads the parent <form>'s state
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Add todo"}
    </button>
  );
}

// Used inside the form:
// <form action={createTodo}>
//   <input name="text" />
//   <SubmitButton />
// </form>`}</code></pre>
        <p className="mb-4">
          Two things trip people up. First, <code>useFormStatus</code>{" "}comes from <code>react-dom</code>, not
          <code> react</code>. Second, and this is the common bug, calling it in the same component that renders the
          <code> &lt;form&gt;</code>{" "}returns <code>pending: false</code>{" "}forever, because there&apos;s no parent form in
          scope yet. The hook reads the form <em>above</em>{" "}it in the tree. Pull the submit button into its own child
          component, as above, and it works. (A component using a client hook needs <code>&quot;use client&quot;</code>.)
        </p>
        <Callout variant="info" title="Why a dedicated hook instead of a prop">
          <p>
            The button doesn&apos;t need to know <em>which</em>{" "}action ran or thread a <code>isSubmitting</code>{" "}boolean down
            through props. <code>useFormStatus</code>{" "}reads the enclosing form&apos;s status from context, so any control
            inside the form, a button, a spinner, a disabled fieldset, can react to &quot;is this form submitting?&quot;{" "}without
            prop-drilling. It&apos;s the pending state living where the form lives.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 6. RESULT/ERROR STATE: useActionState ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Result &amp; error state with <code>useActionState()</code></h2>
        <p className="mb-4">
          <code>useFormStatus</code>{" "}tells you <em>that</em>{" "}the form is submitting. It doesn&apos;t tell you what the action
          <em> returned</em>,{" "}a validation error, a success message, the saved value. For that there&apos;s
          <code> useActionState()</code>{" "}(this is the hook formerly called <code>useFormState</code>; if you see
          <code> useFormState</code>{" "}in older code, it&apos;s the same idea under the previous name).
        </p>
        <p className="mb-4">
          It wraps an action and gives you back its latest return value as state, plus a wrapped action to hand to the form.
          Your action takes the <em>previous state</em>{" "}as its first argument and returns the new state:
        </p>
        <pre><code>{`// action.ts
"use server";

export async function addTodo(prevState, formData) {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) {
    return { error: "Todo text can't be empty." };   // becomes the new state
  }
  await db.todo.create({ data: { text } });
  revalidatePath("/todos");
  return { error: null, ok: true };
}`}</code></pre>
        <pre><code>{`"use client";
import { useActionState } from "react";
import { addTodo } from "./action";

function TodoForm() {
  const [state, formAction, isPending] = useActionState(addTodo, { error: null });

  return (
    <form action={formAction}>
      <input name="text" />
      <button type="submit" disabled={isPending}>Add</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}`}</code></pre>
        <p className="mb-4">
          Now the action&apos;s result drives the UI declaratively: validation failure comes back as <code>state.error</code>
          {" "}and renders inline, success comes back as <code>state.ok</code>. <code>useActionState</code>{" "}also exposes its own
          <code> isPending</code>{" "}flag, so for simple forms you may not even need a separate <code>useFormStatus</code>{" "}button.
          Pick the hook by what you need: <code>useFormStatus</code>{" "}for &quot;is it submitting&quot;{" "}deep inside the form,
          <code> useActionState</code>{" "}for &quot;what did the action say back.&quot;
        </p>
        <Callout variant="warn" title="The action signature changes">
          <p>
            A plain action takes <code>(formData)</code>. An action wrapped by <code>useActionState</code>{" "}takes
            <code> (prevState, formData)</code>,{" "}the previous state is injected as the <em>first</em>{" "}argument and your
            <code> formData</code>{" "}shifts to second. Forget that and you&apos;ll read fields off <code>prevState</code>{" "}and get
            <code> undefined</code>{" "}every time. It&apos;s the number-one gotcha when adopting the hook.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-revalidate-pending" moduleSlug={MODULE_SLUG} title="Revalidation + pending/error UI">
        <Quiz
          kind="Revalidation"
          question="A Server Action creates a todo, but the server-rendered list on the page still shows the old data. What's the correct fix in the App Router?"
          options={[
            {
              label: "Call `revalidatePath('/todos')` (or `revalidateTag('todos')`) inside the action after the write, so the framework rebuilds the cached render with fresh data",
              correct: true,
              explanation:
                "Right. The list is server-rendered output the framework cached. You mark it stale with revalidatePath/revalidateTag and the server re-renders it, no manual fetch, no client copy.",
            },
            {
              label: "Refetch the list with `fetch` in a `useEffect` and store it in `useState`",
              explanation:
                "That reintroduces the client-cache-by-hand anti-pattern. The list isn't client state you own, it's server-rendered data; revalidate it instead of synchronizing a copy.",
            },
            {
              label: "Call `window.location.reload()` after the mutation",
              explanation:
                "A full reload throws away all client state and is far heavier than needed. Targeted revalidation rebuilds only the affected server render.",
            },
            {
              label: "Lower the route's cache time so it eventually refreshes on its own",
              explanation:
                "That's a delayed, indirect refresh, the user wants to see their new todo now. Revalidation after the write refreshes it immediately and precisely.",
            },
          ]}
        />
        <Quiz
          kind="Pending state"
          question="A `SubmitButton` calls `useFormStatus()` but `pending` is always false. The hook is called in the same component that renders the `&lt;form&gt;`. Why?"
          options={[
            {
              label: "`useFormStatus` reads the *nearest enclosing* form, so it must be in a component rendered *inside* the form, not the one rendering the `&lt;form&gt;` itself",
              correct: true,
              explanation:
                "Exactly. There's no parent form in scope where the form is created. Move the submit button into a child component rendered inside the form and it reads the status correctly.",
            },
            {
              label: "`useFormStatus` only works with route handlers, not Server Actions",
              explanation:
                "It works with form actions including Server Actions. The bug is positional, the hook must live inside the form's subtree, not where the form is declared.",
            },
            {
              label: "You must pass the action's `isPending` to the button as a prop; the hook can't read it",
              explanation:
                "The whole point of useFormStatus is to avoid prop-drilling, it reads the enclosing form's status from context. It just has to be called from inside that form.",
            },
            {
              label: "`pending` is only true if you import the hook from `react` instead of `react-dom`",
              explanation:
                "It must come from react-dom (importing from react is its own error), but that wouldn't make pending falsely false, the positional rule is the cause here.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 7. OPTIMISTIC UI ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Optimistic UI with <code>useOptimistic()</code></h2>
        <p className="mb-4">
          Even with revalidation, there&apos;s a beat where the user clicks &quot;Add&quot;{" "}and waits for the round-trip before
          the new todo appears. <code>useOptimistic()</code>{" "}closes that gap: it lets you show the expected result
          <em> immediately</em>, then automatically reconciles with the real server state when the action finishes (and
          discards the optimistic value if it failed).
        </p>
        <pre><code>{`"use client";
import { useOptimistic } from "react";

function TodoList({ todos, addAction }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (current, newText) => [...current, { id: "temp", text: newText, sending: true }],
  );

  async function handleAdd(formData) {
    const text = String(formData.get("text"));
    addOptimistic(text);          // show it instantly
    await addAction(formData);    // real Server Action; revalidation brings truth back
  }

  return (
    <form action={handleAdd}>
      <input name="text" />
      <button type="submit">Add</button>
      <ul>
        {optimisticTodos.map((t) => (
          <li key={t.id} style={{ opacity: t.sending ? 0.5 : 1 }}>{t.text}</li>
        ))}
      </ul>
    </form>
  );
}`}</code></pre>
        <p className="mb-4">
          The flow: <code>addOptimistic(text)</code>{" "}immediately renders the list <em>with</em>{" "}the new item (dimmed, marked
          <code> sending</code>). The real action runs; when it returns and revalidation lands the authoritative list, React
          swaps the optimistic value for the real one. If the action throws, the optimistic addition simply vanishes, React
          reverts to the actual state automatically. You don&apos;t snapshot-and-rollback by hand the way you would in a raw
          cache; <code>useOptimistic</code>{" "}derives the temporary view from the real state and forgets it once the action
          settles.
        </p>
        <Callout variant="insight" title="Optimistic value is derived, not stored">
          <p>
            <code>useOptimistic</code>{" "}doesn&apos;t hold a separate piece of state you have to clean up. It computes a
            <em> view</em>,{" "}&quot;real list, plus the pending change&quot;,{" "}that lives only while the action is in flight. When
            the action resolves and the true state updates, the optimistic layer disappears on its own. That&apos;s why there&apos;s
            no manual rollback: there&apos;s nothing persistent to roll back.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 8. ACTION VS ROUTE HANDLER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Server Action vs Route Handler, when to use which</h2>
        <p className="mb-4">
          A Server Action isn&apos;t the answer to everything. Its sibling is the <strong>Route Handler</strong>,{" "}a real HTTP
          endpoint you define in <code>app/api/.../route.ts</code>{" "}with <code>GET</code>/<code>POST</code>{" "}exports. They
          overlap, but they&apos;re aimed at different jobs:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Server Action</strong>,{" "}a mutation triggered <em>from your own UI</em>: form submits and event-driven
            writes inside your app. It&apos;s tied to your React tree, gives you progressive enhancement, pending state, and
            integrates with revalidation. This is the default for &quot;a button in my app changes server data.&quot;
          </li>
          <li>
            <strong>Route Handler</strong>,{" "}a real, addressable HTTP endpoint for everything that isn&apos;t your own form:
            webhooks from third parties (Stripe, GitHub), a public/mobile API, OAuth callbacks, returning non-HTML responses
            (JSON, files, images), or anything that needs a stable URL and full control over the HTTP request/response.
          </li>
        </ul>
        <pre><code>{`// app/api/webhook/route.ts — a Route Handler: a real URL external systems can POST to
export async function POST(request: Request) {
  const payload = await request.json();
  // verify signature, process the webhook...
  return Response.json({ received: true });
}`}</code></pre>
        <p className="mb-4">
          Rule of thumb: if a human clicking inside <em>your</em>{" "}app triggers the write, reach for a Server Action. If an
          <em> external</em>{" "}caller, another service, a mobile client, a browser hitting a URL directly, needs to reach it,
          you need a Route Handler with a real endpoint. Plenty of apps use both: Actions for in-app forms, Route Handlers
          for the public surface.
        </p>
        <Callout variant="warn" title="Actions are real endpoints, validate the input">
          <p>
            It feels like calling a local function, but a Server Action compiles down to a server endpoint that anyone can
            invoke, not just your form. Never trust the incoming <code>FormData</code>. Validate and sanitize every field on
            the server (a schema validator like Zod is the norm), check authentication and authorization inside the action,
            and don&apos;t assume the client-side <code>required</code>{" "}attribute ran. The convenience hides the fact that
            you&apos;ve published an endpoint.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-optimistic-vs-route" moduleSlug={MODULE_SLUG} title="Optimistic UI & Action vs Route Handler">
        <Quiz
          kind="Optimistic UI"
          question="With `useOptimistic`, what happens to the optimistically-added item if the underlying Server Action throws?"
          options={[
            {
              label: "It disappears automatically, the optimistic view is derived from real state and is discarded once the action settles, with no manual rollback",
              correct: true,
              explanation:
                "Right. useOptimistic computes a temporary 'real state + pending change' view that only exists while the action is in flight. On failure, React reverts to the real state on its own.",
            },
            {
              label: "It stays on screen permanently until you manually call a rollback function",
              explanation:
                "There's nothing to manually roll back, the optimistic value isn't stored separately. It's derived and discarded automatically when the action settles.",
            },
            {
              label: "React shows an error boundary and unmounts the whole list",
              explanation:
                "A thrown action doesn't tear down the list. The optimistic item simply reverts; you handle the error message separately (e.g. via useActionState).",
            },
            {
              label: "The item is written to the cache anyway and reconciled on the next page load",
              explanation:
                "An optimistic update is never persisted by itself, it's a temporary UI view. If the action fails, nothing was saved and the view reverts.",
            },
          ]}
        />
        <Quiz
          kind="Action vs Route Handler"
          question="A third-party payment provider needs to POST webhook events to your app at a stable URL. Server Action or Route Handler?"
          options={[
            {
              label: "Route Handler, it's an external caller that needs a real, addressable HTTP endpoint with full control over the request/response",
              correct: true,
              explanation:
                "Right. Webhooks, public/mobile APIs, OAuth callbacks, and non-HTML responses are Route Handler territory. Server Actions are for mutations triggered from your own UI.",
            },
            {
              label: "Server Action, it handles all POST requests in the App Router",
              explanation:
                "Server Actions are meant for in-app form/event-driven mutations, not as a general public HTTP endpoint an external system addresses by URL.",
            },
            {
              label: "Neither, webhooks must be handled by a separate Express server",
              explanation:
                "No separate server is needed. A Route Handler in app/api/.../route.ts is a real HTTP endpoint built for exactly this.",
            },
            {
              label: "Either works identically; the choice is purely stylistic",
              explanation:
                "They're aimed at different jobs. An external caller needs the stable, addressable URL and HTTP control a Route Handler provides, a Server Action is coupled to your UI.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 9. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;how do Server Actions work?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>A Server Action is a <code>&quot;use server&quot;</code>{" "}async function</strong>{" "}that runs on the server
              but is callable from the client. Its body never ships to the browser, only the ability to invoke it.
            </li>
            <li>
              <strong>Attach it to a form&apos;s <code>action</code>{" "}prop</strong>{" "}and you get progressive enhancement: the
              form does a native POST and works without JS, then React enhances it to update in place once JS loads.
            </li>
            <li>
              <strong>After a write, revalidate, don&apos;t refetch.</strong>{" "}<code>revalidatePath</code>{" "}rebuilds a route&apos;s
              cached render; <code>revalidateTag</code>{" "}rebuilds everything tagged with that data. The server owns the data;
              you just mark it stale.
            </li>
            <li>
              <strong>Pending &amp; error UI:</strong>{" "}<code>useFormStatus()</code>{" "}(from <code>react-dom</code>, called
              <em> inside</em>{" "}the form) for &quot;is it submitting&quot;; <code>useActionState()</code>{" "}(formerly
              <code> useFormState</code>) for the action&apos;s returned result/error; <code>useOptimistic()</code>{" "}for an
              instant, auto-reverting optimistic view.
            </li>
            <li>
              <strong>Action vs Route Handler:</strong>{" "}Action for mutations from your own UI; Route Handler
              (<code>app/api/.../route.ts</code>) for external callers, webhooks, public APIs, and non-HTML responses.
            </li>
            <li>
              <strong>Actions are real endpoints, validate input,</strong>{" "}check auth, and never trust the incoming
              <code> FormData</code>.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 10. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, a to-do feature with zero API routes</h2>
        <p className="mb-4">
          Build an add/edit/delete to-do feature <em>entirely</em>{" "}with Server Actions, no <code>fetch</code>, no
          <code> app/api</code>{" "}routes, with pending state via <code>useFormStatus</code>, optimistic UI, and
          <code> revalidatePath</code>{" "}after each mutation. The goal is to feel how a whole CRUD surface works without
          hand-building a single endpoint or client cache.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Render the list in a Server Component.</strong>{" "}A <code>/todos</code>{" "}page that reads the todos on the
            server (a module-level array or a tiny DB is fine) and renders them. No <code>useEffect</code>, no client fetch,
            the data arrives with the HTML.
          </li>
          <li>
            <strong>Add with a Server Action + form.</strong>{" "}Write <code>createTodo(formData)</code>{" "}marked
            <code> &quot;use server&quot;</code>, attach it to <code>&lt;form action=&#123;createTodo&#125;&gt;</code>, and call
            <code> revalidatePath(&quot;/todos&quot;)</code>{" "}after the write. Confirm the new todo appears, then disable
            JavaScript in DevTools and confirm the form <em>still</em>{" "}adds a todo via native POST.
          </li>
          <li>
            <strong>Add pending state.</strong>{" "}Pull the submit button into a <code>&quot;use client&quot;</code>
            {" "}<code>SubmitButton</code>{" "}rendered inside the form, read <code>useFormStatus()</code>, and show
            &quot;Adding…&quot;{" "}with the button disabled while pending. Verify it reads <code>false</code>{" "}if you mistakenly
            put the hook in the form-rendering component, then fix it.
          </li>
          <li>
            <strong>Delete and edit.</strong>{" "}Add <code>deleteTodo(id)</code>{" "}and <code>updateTodo(id, formData)</code>
            {" "}actions, each ending in <code>revalidatePath(&quot;/todos&quot;)</code>. Wire delete to a tiny form per row;
            wire edit to an inline form. Notice you never wrote a route or a fetch for any of them.
          </li>
          <li>
            <strong>Add validation + error UI.</strong>{" "}Convert the add action to the <code>useActionState</code>{" "}shape
            (<code>(prevState, formData)</code>), reject empty text by returning <code>&#123; error &#125;</code>, and render
            <code> state.error</code>{" "}inline with <code>role=&quot;alert&quot;</code>. Validate on the <em>server</em>, not
            just with the input&apos;s <code>required</code>{" "}attribute.
          </li>
          <li>
            <strong>Make add optimistic.</strong>{" "}Use <code>useOptimistic</code>{" "}to show the new todo instantly (dimmed
            while sending). Throttle the action with an artificial delay and watch the item appear immediately, then settle
            when revalidation lands, and revert cleanly if you make the action throw.
          </li>
          <li>
            <strong>Stretch, draw the boundary.</strong>{" "}Add one <code>app/api/todos/route.ts</code>{" "}Route Handler that
            returns the list as JSON, and write one sentence in a comment explaining why <em>that</em>{" "}is a Route Handler
            (an external/JSON endpoint) while your add/edit/delete are Server Actions (in-app mutations).
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you come from server work: a Server Action is an RPC whose transport the framework generates for you, you call
            a function, it runs a procedure on the server. <code>revalidatePath</code>/<code>revalidateTag</code>{" "}are
            cache-invalidation calls against the framework&apos;s render cache, the same instinct as busting a CDN or Redis key
            after a write. And the &quot;validate input, check auth&quot;{" "}warning is the same rule you&apos;d apply to any public
            endpoint, because that&apos;s exactly what an Action compiles into.
          </p>
        </Callout>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
