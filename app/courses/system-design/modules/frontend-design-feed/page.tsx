import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import PartRecap from "@/components/PartRecap";
import CodeBlock from "@/components/CodeBlock";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";

const CHECKPOINTS = [
  { id: "scope", title: "Scope + components", xp: 15 },
  { id: "state", title: "State + data fetching", xp: 25 },
  { id: "perf", title: "Virtualization + images", xp: 25 },
  { id: "complete", title: "Optimistic + offline + a11y", xp: 25 },
];

export default function Page() {
  const mod = getModuleBySlug("frontend-design-feed")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
      </header>

      <ModuleProgress moduleSlug={mod.slug} checkpoints={CHECKPOINTS} />

      <section className="my-10 p-6 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-900 bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/40 dark:to-pink-950/40">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs uppercase tracking-wider font-bold text-fuchsia-700 dark:text-fuchsia-300">The opener</span>
        </div>
        <p className="text-base leading-relaxed m-0">
          The interviewer says: <em>{`"Design the Twitter feed UI."`}</em> A mid-level candidate immediately starts naming components — FeedItem, Avatar, LikeButton — and burns ten minutes drawing a tree. A senior candidate stops and asks: <em>{`"Chronological or ranked? Mobile-first or desktop? Do likes need to feel instant? Offline read? Image-heavy or mostly text? Real-time push for new posts, or polling?"`}</em> Six questions in thirty seconds, and now we have a scope we can actually finish in 45 minutes.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 mb-0">
          This module walks the feed UI design end-to-end — the same pattern you would use in a senior frontend system design interview at Meta, Stripe, Airbnb, or any FAANG that takes the front of the stack seriously. You will leave with a defensible answer for components, state shape, data fetching, virtualization, optimistic updates, image loading, offline read, and accessibility. The architecture is different from a backend system design; the framework — clarify, design, deep-dive, wrap — is the same.
        </p>
      </section>

      <Checkpoint moduleSlug={mod.slug} id="scope" title="Part 1 · Scope + components" xp={15}>
        <h2>Scope clarification — the senior signal in the first two minutes</h2>
        <p>
          Frontend system design has a dirty secret: the prompt is <em>always</em> ambiguous. {`"Design the Twitter feed"`} could mean a hundred different things, and the interviewer is watching to see whether you notice. A mid-level candidate sees {`"feed"`} and starts thinking about <code>{`<FeedItem />`}</code>. A senior candidate sees {`"feed"`} and starts thinking about which dimensions of the problem are actually open.
        </p>
        <p>Here are the six questions I ask, every time, before I touch a single component:</p>

        <ol>
          <li><strong>Chronological or ranked?</strong> A reverse-chronological feed is a sorted query. A ranked feed pulls from a server-side scoring service and the client treats the order as opaque. The data layer is identical; what changes is whether the client can re-sort locally on a refresh (chronological: yes, ranked: no).</li>
          <li><strong>Web, mobile web, or native?</strong> Web has more memory, more screen real estate, and a real DOM. Mobile web has stricter memory pressure (Safari kills tabs at ~1GB), worse network, and a thumb-driven scroll model. {`"Web + mobile web in one responsive bundle"`} is the most common scope and what I will assume.</li>
          <li><strong>Optimistic interactions?</strong> Tap-to-like — does the heart fill instantly, or wait for the server? {`"Instantly"`} is the right product answer 99% of the time, but it forces a real contract with the API: what if the like fails? what if the server returns a different count?</li>
          <li><strong>Offline read?</strong> If the user opens the app on a subway, what do they see? A blank screen, the last-loaded items, or an error? Offline read is roughly 2–3x the engineering cost — service worker, cache strategy, sync UX — so we want to know if it is in scope.</li>
          <li><strong>Real-time new-post indicator?</strong> {`"42 new tweets"`} appearing at the top of the feed. Server-push (WebSocket / SSE) gives instant updates and a persistent connection per user. Polling (every 30–60s) is one round-trip per interval and dramatically simpler. The product impact of {`"6s slower"`} is usually acceptable.</li>
          <li><strong>Image-heavy or text-only?</strong> If 80% of items have images, perceived performance lives or dies by image loading strategy (LQIP, lazy-load, aspect-ratio reservation). If items are mostly text, you can spend that complexity budget elsewhere.</li>
        </ol>

        <Callout variant="info" title="The scope I am locking in for this design">
          <ul className="m-0">
            <li><strong>Ranked feed</strong> — the server returns an ordered list; the client treats order as opaque.</li>
            <li><strong>Web + mobile web</strong> — one responsive bundle, no native code.</li>
            <li><strong>Optimistic likes and retweets</strong> — UI updates instantly; we will design the rollback contract.</li>
            <li><strong>Offline read</strong> — last-loaded items are viewable when offline; mutations queue or fail loudly.</li>
            <li><strong>No real-time push</strong> — polling every 30s for the {`"new posts"`} indicator only. Items themselves are not push-updated.</li>
            <li><strong>Image-heavy</strong> — about half of items have media; we will treat image loading as first-class.</li>
          </ul>
        </Callout>

        <p>
          Why this scope-locking matters: a feed UI <em>with</em> offline read and real-time push is roughly 3x the work of one without. The candidate who quietly designs all of it ends up rambling at minute 30 with nothing finished. The candidate who locks scope explicitly — {`"I am punting real-time push, here is why"`} — finishes a complete answer with depth in two areas. The interviewer wants the second one.
        </p>

        <h2>Component breakdown</h2>
        <p>
          Now we can decompose. The right granularity is {`"components that own a meaningful piece of state or markup."`} A component per <code>{`<span>`}</code> is overkill; one giant FeedPage is under-decomposed.
        </p>

        <CodeBlock lang="plain" caption="Component tree">{`FeedPage
  ├─ FeedHeader
  │   └─ ComposeBox          (text input + media picker, opens modal)
  ├─ NewPostsIndicator        ("42 new tweets — tap to load")
  └─ FeedList                 (virtualized — see Part 5)
      └─ FeedItem             (one tweet)
          ├─ AuthorBlock      (avatar, name, handle, timestamp)
          ├─ Content          (text with link/mention parsing)
          ├─ MediaRenderer    (image, video, link card — chosen by media type)
          └─ ActionBar        (like, retweet, reply, share)`}</CodeBlock>

        <h3>What is reusable, what is leaf</h3>
        <ul>
          <li><strong>Reusable across the app:</strong> AuthorBlock (used on profile pages too), MediaRenderer (used in tweet detail, search results), ActionBar variants. These should live in a shared <code>components/</code> directory, not inside the feed module.</li>
          <li><strong>Feed-specific:</strong> FeedList, FeedItem, NewPostsIndicator. These know about feed-specific concerns (virtualization, polling, ordering).</li>
          <li><strong>Page-level:</strong> FeedPage. Owns the data fetching hooks and passes data down. In a Next.js app, this is a route component.</li>
        </ul>

        <h3>Where state lives</h3>
        <p>
          The big architectural call: <strong>server data lives in a server-state cache (React Query / SWR), not in component state</strong>. Component state is reserved for things that are genuinely local: {`"is the compose modal open"`}, {`"is the action menu expanded on this item"`}, {`"what text is in the compose input."`} If you put server data in <code>useState</code>, you will spend the rest of the interview explaining why two tabs disagree about the like count.
        </p>

        <CodeBlock lang="plain" caption="State ownership table">{`Server state (React Query cache):
  - Feed pages and their items
  - Per-item like / retweet counts
  - Per-item viewer-liked / viewer-retweeted
  - User profiles referenced in items

Component state (useState / useReducer):
  - Is the compose modal open
  - Is the per-item action menu expanded
  - Compose draft text (until submitted)
  - Scroll position / focused item index (keyboard nav)

URL state (search params):
  - Active feed filter (Following / For You)
  - Deep-linked tweet ID (open in modal)

Browser-managed:
  - Scroll position (Next.js App Router restores on back)
  - Focus`}</CodeBlock>

        <Quiz
          question="The interviewer says 'Twitter feed.' What is the strongest first move?"
          options={[
            { label: "Ask 5–6 scope-locking questions in 30 seconds: ranked vs chrono, web vs native, optimistic interactions, offline, real-time push, image-heavy. Then propose a concrete scope and ask for buy-in.", correct: true, explanation: "Right. Rapid scope-locking is the senior signal. The interviewer wants to see that you know which dimensions of a 'feed' are actually variable, and that you can pick a scope you can finish in 45 minutes." },
            { label: "Start drawing the component tree — FeedItem, Avatar, LikeButton — to show structure.", explanation: "This is the mid-level move. You will spend ten minutes on a tree that you have to redraw once you discover the scope." },
            { label: "Ask the interviewer for the full PRD.", explanation: "There is no PRD. The interviewer expects you to derive scope by asking sharp questions, not by demanding documentation." },
            { label: "Estimate QPS and storage.", explanation: "That is a backend system design opener. Frontend design is about UX, components, state, and perceived performance — different load-bearing axes." },
          ]}
          hint="What can you not start designing without?"
          xp={6}
        />

        <Quiz
          question="Why does it matter to lock scope on offline read explicitly at minute 2?"
          options={[
            { label: "Adding offline read is roughly 2–3x the engineering cost (service worker, cache strategy, sync UX, conflict resolution). If it is in scope you must budget for it; if it is not, you avoid getting trapped explaining it at minute 30.", correct: true, explanation: "Yes. Offline-capable is a major scope multiplier. Explicit scoping at minute 2 means you can finish a complete answer at minute 40, with depth where it matters." },
            { label: "Service workers do not work on mobile.", explanation: "They do work on mobile (with caveats). The cost argument is what matters — not capability." },
            { label: "Offline read requires backend changes you do not control.", explanation: "Offline read is mostly client-side. You can build it without any backend work in many cases." },
            { label: "It is not real engineering work.", explanation: "It is real work — that is exactly why scope discipline matters." },
          ]}
          hint="The point is not whether offline is hard — it is whether you have time."
          xp={6}
        />

        <Quiz
          question="Why does server data belong in a React Query cache instead of component useState?"
          options={[
            { label: "Server data is shared across components, may change from another tab or device, and needs background refetch / invalidation. useState ties data to a component lifecycle and gives you no way to share or refresh it without prop-drilling and manual sync.", correct: true, explanation: "Right. The defining property of server state is that it is owned by the server, not the component. React Query encodes that — caching, dedup, refetch, invalidation all become first-class instead of bespoke." },
            { label: "useState is deprecated for async data.", explanation: "useState is not deprecated. The point is fitness, not deprecation." },
            { label: "React Query is faster.", explanation: "Speed is not the argument. The argument is correctness — useState gives you stale, unshared, un-invalidatable data." },
            { label: "Component state cannot be persisted across reloads.", explanation: "Some component state lives across reloads via URL or localStorage. That is not the point — the point is shared, refetchable server data." },
          ]}
          hint="What does 'server state' mean as a category, and what does that demand of the storage primitive?"
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Scope-locking is a 30-second senior move. Six questions narrow a vague prompt to a buildable design. Then the component tree falls out — and the load-bearing call is where state lives, not what components exist."
          points={[
            { takeaway: "Open with 5–6 scope questions, in 30 seconds", detail: "Ranked vs chrono, web vs native, optimistic, offline, real-time, image-heavy. Lock scope before drawing components." },
            { takeaway: "Offline + real-time are 2–3x scope multipliers", detail: "If in scope, budget for them. If not, name them and punt explicitly. The candidate who silently includes them runs out of time." },
            { takeaway: "Decompose at meaningful state/markup boundaries", detail: "Reusable across app (AuthorBlock), feed-specific (FeedList, FeedItem), page-level (FeedPage). Avoid components-per-span." },
            { takeaway: "Server state in a cache, component state for UI", detail: "React Query owns feed data, like counts, viewer state. useState owns 'is the menu open.' URL owns the active filter." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="state" title="Part 2 · State shape + data fetching" xp={25}>
        <h2>The state shape — the senior signal</h2>
        <p>
          Most candidates skip directly from the component tree to data fetching and never write down the actual data shape. That is a mistake — the shape encodes every assumption you have about what the server returns, what the client owns, and how mutations interact with reads. Show the shape early; everything else falls out of it.
        </p>

        <CodeBlock lang="ts" caption="The FeedItem type — including optimistic-update fields">{`type FeedItem = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;          // ISO 8601 from server
  media?: Media[];
  stats: {
    likes: number;
    retweets: number;
    replies: number;
  };

  // Viewer state — depends on who is requesting
  viewerLiked: boolean;
  viewerRetweeted: boolean;

  // Optimistic-update bookkeeping (client-only, not from server)
  pendingLike?: {
    mutationId: string;        // for idempotent retry
    previousValue: boolean;    // for rollback on failure
    previousCount: number;
  };
  pendingRetweet?: {
    mutationId: string;
    previousValue: boolean;
    previousCount: number;
  };
};

type Media =
  | { kind: "image"; url: string; blurDataUrl: string; width: number; height: number; alt: string | null }
  | { kind: "video"; url: string; posterUrl: string; durationSec: number }
  | { kind: "link";  url: string; title: string; description: string; imageUrl?: string };

type Author = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  verified: boolean;
};`}</CodeBlock>

        <p>
          Three things to call out about this shape:
        </p>
        <ol>
          <li><strong>Authors are referenced by ID, not embedded.</strong> A retweet of a tweet from a popular account would otherwise duplicate the author payload across every retweet on the page. Reference + lookup keeps the wire payload small and lets the client cache authors once.</li>
          <li><strong>viewerLiked is on the item, not separate.</strong> Embedding viewer state in the item means one fetch returns everything the UI needs to render. The alternative — separate {`/me/likes`} endpoint — doubles round trips and creates ordering bugs.</li>
          <li><strong>pendingLike is client-only.</strong> The server never sees this field. It exists so the optimistic-update logic can roll back cleanly if the mutation fails. We will use it heavily in Part 6.</li>
        </ol>

        <Callout variant="insight" title="The Media discriminated union is doing real work">
          Each media kind has different fields the renderer needs (blurDataUrl for images, posterUrl for video, title/description for links). A discriminated union with a <code>kind</code> tag lets the MediaRenderer be a clean switch on <code>kind</code> with full type narrowing — no <code>any</code>, no optional chaining everywhere. This is the kind of detail the senior interviewer notices.
        </Callout>

        <h2>Cursor pagination — why offset breaks for feeds</h2>
        <p>
          Now data fetching. The naive thing is offset pagination: <code>GET /feed?page=1</code>, <code>page=2</code>, etc. This breaks for feeds, and the reason is worth saying out loud.
        </p>
        <p>
          A feed is mutable: new items are inserted at the top while the user is reading. With offset pagination, by the time the client requests page 2, two new items have arrived at the top. {`"Page 2"`} now starts in a different place — the user sees duplicate items (items shifted from page 1 to page 2) or skipped items (depending on the direction of insertion). This is not a minor bug; on a busy timeline it makes pagination feel actively broken.
        </p>

        <CodeBlock lang="plain" caption="Why offset pagination breaks for an inserting feed">{`t=0:  Server feed = [A, B, C, D, E, F]
      Client requests page 1 (offset=0, limit=3)
      Client receives [A, B, C]

t=1:  Server inserts [Z, Y] at the top
      Server feed = [Z, Y, A, B, C, D, E, F]

t=2:  Client requests page 2 (offset=3, limit=3)
      Client receives [B, C, D]   <-- B and C are duplicates!

If the client used 'unique IDs' to dedup, items D, E would be missing
from the page 1 cursor entirely. Either way: bad UX.`}</CodeBlock>

        <p>
          Cursor pagination fixes this. The server returns an opaque cursor with each page; the client passes that cursor back to ask for {`"the page after this point in the feed I just got."`} The cursor encodes a position relative to the items the client has already seen, not an absolute offset.
        </p>

        <CodeBlock lang="ts" caption="Cursor pagination response shape">{`type FeedPage = {
  items: FeedItem[];
  nextCursor: string | null;   // null when there are no more pages
  hasMore: boolean;
};

// The cursor is opaque to the client. Server-side it might be:
//   base64({ rankedScore: 0.81, itemId: "tw_abc123", v: 1 })
// or for a chronological feed:
//   base64({ createdAt: "2026-05-04T18:42:11Z", itemId: "tw_abc123" })
//
// The client never parses it. That is intentional — it lets the
// server change the ordering scheme without breaking clients.`}</CodeBlock>

        <p>
          Notice what is not there: a total count. Computing {`"how many items remain"`} on a personalized ranked feed is expensive and meaningless — the rank changes constantly. <code>hasMore</code> is what the user actually needs.
        </p>

        <h2>useInfiniteQuery — the React Query primitive</h2>
        <p>
          React Query has <code>useInfiniteQuery</code> built specifically for cursor pagination. It tracks an array of pages, exposes a <code>fetchNextPage</code> function, and de-dupes concurrent fetches. Here is the full data hook in 30 lines:
        </p>

        <CodeBlock lang="tsx" caption="hooks/useFeed.ts">{`import { useInfiniteQuery } from "@tanstack/react-query";

async function fetchFeedPage(cursor: string | null): Promise<FeedPage> {
  const url = cursor
    ? \`/api/feed?cursor=\${encodeURIComponent(cursor)}\`
    : \`/api/feed\`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(\`Feed fetch failed: \${res.status}\`);
  return res.json();
}

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,

    // Stale-while-revalidate: serve cached pages instantly, refetch in
    // the background. 60s feels fresh without hammering the API.
    staleTime: 60 * 1000,

    // Keep the data in cache for 10 min after the last subscriber unmounts,
    // so back-navigation feels instant.
    gcTime: 10 * 60 * 1000,
  });
}`}</CodeBlock>

        <p>
          A consumer flattens the pages and renders them:
        </p>

        <CodeBlock lang="tsx" caption="FeedList consumer">{`function FeedList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();

  // pages is an array of FeedPage; flatten for rendering
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <VirtualizedList
      items={items}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
    />
  );
}`}</CodeBlock>

        <h2>Triggering load-more — intersection observer, not scroll listener</h2>
        <p>
          The classic mistake is wiring a scroll listener: <code>window.addEventListener("scroll", ...)</code> and computing {`"are we near the bottom"`} on every event. Two problems:
        </p>
        <ol>
          <li><strong>Scroll fires constantly</strong> — every frame on a fast scroll. You end up running JavaScript on every pixel of scroll, which competes with the render thread you most need to be fast.</li>
          <li><strong>The {`"near the bottom"`} math is fragile</strong> — it depends on layout that is changing as items load. Off-by-a-few-pixels bugs lead to never triggering, or triggering twice.</li>
        </ol>
        <p>
          IntersectionObserver is the modern primitive. You attach a sentinel element below the last item; the browser fires a callback when it enters the viewport. The browser is doing the geometry work natively (cheaper than JS) and the observer fires on a clean threshold (no fragile math).
        </p>

        <CodeBlock lang="tsx" caption="hooks/useInfiniteScroll.ts">{`import { useEffect, useRef } from "react";

export function useInfiniteScroll(onEndReached: () => void) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Single sentinel, single entry
        if (entries[0]?.isIntersecting) onEndReached();
      },
      {
        // Pre-load when the sentinel is 600px from the viewport, so the
        // next page lands before the user actually reaches the bottom.
        rootMargin: "600px 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onEndReached]);

  return sentinelRef;
}

// Usage: <div ref={sentinelRef} aria-hidden="true" />`}</CodeBlock>

        <h2>Cache invalidation — the two real triggers</h2>
        <p>
          When does the feed cache become stale? Two events matter:
        </p>
        <ol>
          <li><strong>The user pulls to refresh</strong> (or clicks a refresh control). We want to drop the cached pages and refetch from cursor=null. React Query: <code>queryClient.invalidateQueries({`{ queryKey: ["feed"] }`})</code>.</li>
          <li><strong>The user posts a new tweet of their own.</strong> Their own tweet should appear at the top immediately. Two strategies: (a) optimistically prepend the new tweet to the cached first page, or (b) invalidate and refetch. (a) is faster and feels instant; (b) is simpler and gets you the canonical server ordering. I would do (a) for the user-perceived experience, with a background refetch that reconciles after.</li>
        </ol>
        <p>
          What does <em>not</em> trigger invalidation: a like on someone else{`'`}s tweet, scroll position changes, time passing without user action. Aggressive invalidation kills perceived performance — a feed that refetches every minute will spend its life in a loading state.
        </p>

        <Callout variant="warn" title="The pull-to-refresh UX trap">
          When the user pulls to refresh, do not hide the cached items while the refetch runs. Show a small spinner at the top, keep the existing items visible, and swap them when the new data arrives. {`"Hide everything, show a big spinner, then show new content"`} is a downgrade from the cached state — the user already had something they could read. React Query{`'`}s <code>isFetching</code> vs <code>isLoading</code> distinction is exactly this: <code>isLoading</code> = no data yet, <code>isFetching</code> = refetching but we have data.
        </Callout>

        <Quiz
          question="Why does cursor pagination beat offset pagination for a feed?"
          options={[
            { label: "Feeds insert items at the top while the user is reading. Offset pagination measures from the start of the list, so any insertion shifts items between pages — clients see duplicates or miss items. Cursors encode 'the next item after this one' relative to the page just returned, so insertions do not corrupt subsequent pages.", correct: true, explanation: "Right. The defining property of an offset is that it depends on the absolute order of all items, including ones the client has not seen. Cursors are relative — they survive insertions." },
            { label: "Cursors are smaller over the wire than page numbers.", explanation: "Page numbers are tiny too. Wire size is not the difference; semantics are." },
            { label: "Offset pagination is deprecated.", explanation: "Plenty of APIs still use offsets; it is fine for stable, append-only lists. The argument is fitness for inserting feeds, not deprecation." },
            { label: "Cursors let the server cache responses better.", explanation: "True for some implementations but not the load-bearing argument. The argument is correctness under insertion, which offsets cannot give." },
          ]}
          hint="What happens at offset=3 if two items were just inserted at the top?"
          xp={6}
        />

        <Quiz
          question="Why use IntersectionObserver instead of a scroll listener for load-more?"
          options={[
            { label: "Scroll listeners run JS on every frame of scrolling, competing with the render thread, and the 'near the bottom' math is fragile under dynamic layout. IntersectionObserver lets the browser compute viewport intersection natively and fires only when a sentinel crosses the threshold.", correct: true, explanation: "Right. The performance argument and the correctness argument are both real. Scroll listeners are a classic source of jank and off-by-pixel bugs." },
            { label: "Scroll listeners are deprecated in modern browsers.", explanation: "They are not deprecated. They are just a worse fit for this specific problem." },
            { label: "IntersectionObserver works offline.", explanation: "Both APIs work offline; that is not the relevant axis." },
            { label: "Scroll listeners cannot trigger network requests.", explanation: "They can — that is exactly how the legacy pattern worked, and exactly the source of the jank." },
          ]}
          hint="What is the cost of running JS on every scroll event vs a callback that fires once when an element crosses a threshold?"
          xp={6}
        />

        <Quiz
          question="Why does the cursor in a cursor-paginated API need to be opaque to the client?"
          options={[
            { label: "Opacity lets the server change the ordering scheme — chronological, ranked by score, mixed with ads — without breaking deployed clients. If the cursor is structured (e.g. a timestamp), every client implicitly depends on that scheme and the server cannot evolve it without coordination.", correct: true, explanation: "Right. Opaque cursors are an API evolution lever. They keep the client coupled to 'a position' instead of 'a particular ordering scheme.'" },
            { label: "Opaque cursors are smaller than structured ones.", explanation: "Size is not the argument and is often the opposite — opaque cursors with versioning carry more bytes." },
            { label: "Opacity prevents replay attacks.", explanation: "Cursors are not security tokens. Auth and replay protection live elsewhere." },
            { label: "It is a JSON-API spec requirement.", explanation: "Specs vary; opaque cursors are a convention, not a hard requirement. The argument is API evolution." },
          ]}
          hint="What changes if you ship a v2 ranking model and old clients are still running?"
          xp={5}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Show the state shape early — it encodes every assumption. Cursor pagination, useInfiniteQuery, and an IntersectionObserver sentinel give you the entire data layer in about 60 lines. Stale-while-revalidate is the cache discipline; invalidation is rare and surgical."
          points={[
            { takeaway: "Lead with the data shape, not the components", detail: "Reference authors by ID (don't embed), put viewer state on the item, keep optimistic-update bookkeeping client-only." },
            { takeaway: "Cursor pagination beats offset for inserting feeds", detail: "Offset is broken under insertion (duplicates / skips). Opaque cursors leave the server free to evolve ordering." },
            { takeaway: "useInfiniteQuery handles pages, dedup, and SWR", detail: "30 lines: queryFn, getNextPageParam, staleTime, gcTime. Consumers flatten pages and render." },
            { takeaway: "Trigger load-more with IntersectionObserver, not scroll", detail: "Sentinel + rootMargin pre-loads before the user hits bottom; the browser does the geometry natively." },
            { takeaway: "Invalidate rarely, on real user intent", detail: "Pull-to-refresh, posting your own tweet. Not on time, not on someone else's like. Cached items stay visible during refetch." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="perf" title="Part 3 · Virtualization + image loading" xp={25}>
        <h2>Virtualization — the perf-critical piece</h2>
        <p>
          Here is the math. A user who has been scrolling for a few minutes has 10,000 feed items in memory (it adds up fast — 100 items per page, 100 pages). Each FeedItem renders roughly 8 DOM nodes (article wrapper, author block, content, media, action bar with four buttons). That is 80,000 DOM nodes in the page.
        </p>
        <p>
          Browsers do not gracefully handle 80,000 nodes. Layout, paint, and any CSS containment query becomes a multi-second operation. Memory grows past 1GB on some devices. On Safari mobile, the OS will kill the tab. Even on desktop, a single resize event triggers reflow and the page locks for two to three seconds.
        </p>
        <p>
          Virtualization is the fix. The idea: only the items currently visible are in the DOM. Items above and below are represented by spacer divs that preserve scroll geometry. When the user scrolls, we render new items into the viewport and unmount items that have left.
        </p>

        <CodeBlock lang="plain" caption="What virtualization actually does">{`Without virtualization, 10,000 items in DOM:
  ┌────────────────┐
  │ Item 0  (DOM)  │  ← off-screen, costs memory + layout
  │ Item 1  (DOM)  │
  │  ... 5000 ...  │
  │ Item 5043 (DOM)│  ← visible
  │ Item 5044 (DOM)│  ← visible
  │ Item 5045 (DOM)│  ← visible
  │  ... 5000 ...  │
  │ Item 9999 (DOM)│  ← off-screen
  └────────────────┘
  Total: 10,000 items rendered. Every layout pass walks all of them.

With virtualization, only ~30 items in DOM:
  ┌────────────────────────────────┐
  │ <div height=5043*itemH />       │  ← spacer above
  │ Item 5040 (DOM, overscan)      │
  │ Item 5041 (DOM, overscan)      │
  │ Item 5042 (DOM, overscan)      │
  │ Item 5043 (DOM, visible)       │
  │ Item 5044 (DOM, visible)       │
  │ Item 5045 (DOM, visible)       │
  │ Item 5046 (DOM, overscan)      │
  │ Item 5047 (DOM, overscan)      │
  │ <div height=4952*itemH />       │  ← spacer below
  └────────────────────────────────┘
  Total: ~8 items rendered. Layout walks only those.`}</CodeBlock>

        <p>
          The two spacer divs preserve the scrollbar position and total scroll height. The browser thinks the page is 10,000-items tall; it just doesn{`'`}t know most of that is empty space. As the user scrolls, we recompute which slice of items is visible, render those, and adjust the spacers.
        </p>

        <h2>Using react-virtual (now @tanstack/react-virtual)</h2>
        <p>
          We could write this from scratch — and historically I have, for fixed-height lists — but for variable-height items in production, use a library. <code>@tanstack/react-virtual</code> is small, headless (you control the DOM), and handles measurement.
        </p>

        <CodeBlock lang="tsx" caption="VirtualizedList with @tanstack/react-virtual">{`import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

function VirtualizedList({ items, onEndReached }: {
  items: FeedItem[];
  onEndReached: () => void;
}) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,        // best-guess starting height
    overscan: 5,                     // render 5 items above + below visible
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastIndex = virtualItems[virtualItems.length - 1]?.index ?? 0;

  // Trigger load-more when within 5 items of the end
  if (lastIndex >= items.length - 5) onEndReached();

  return (
    <div ref={parentRef} style={{ height: "100vh", overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualItems.map((virtualItem) => (
          <div
            key={items[virtualItem.index].id}
            ref={virtualizer.measureElement}
            data-index={virtualItem.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: \`translateY(\${virtualItem.start}px)\`,
            }}
          >
            <FeedItem item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}`}</CodeBlock>

        <p>
          The crucial line is <code>ref={`{virtualizer.measureElement}`}</code>. After render, the library measures the actual rendered height of each item and adjusts the virtualization geometry. If our <code>estimateSize</code> said 280px but the item rendered at 410px (long tweet with image), the library updates the model and the spacer divs adjust.
        </p>

        <h2>Variable-height items — the real challenge</h2>
        <p>
          Fixed-height virtualization is easy: every item is 80px tall, total height is <code>count * 80</code>, the visible slice is <code>scrollTop / 80</code>. Done.
        </p>
        <p>
          Feed items are not fixed height. A short text-only tweet is 120px. A tweet with a 16:9 image is 480px. A tweet with a quoted tweet that has a video is 720px. You don{`'`}t know the height until you render the item. And if you guess wrong, the scrollbar jumps as items below {`"resize"`} when they are first rendered — a deeply broken UX.
        </p>
        <p>There are three real strategies:</p>

        <ol>
          <li><strong>Estimate + measure-and-adjust.</strong> What @tanstack/react-virtual does. Provide an <code>estimateSize</code>; render with the estimate; measure on first render; cache and reuse. The first scroll is slightly off, but caching makes subsequent renders accurate. Works well in practice; expect occasional small jumps when scrolling fast through never-rendered items.</li>
          <li><strong>Pre-compute heights server-side.</strong> The server returns a height hint per item, computed from text length, media dimensions, and the known styling. Eliminates the {`"first render is wrong"`} jump but couples the server to client styling decisions — every CSS change requires re-deriving the formula. Not worth it for most teams.</li>
          <li><strong>Impose fixed-height constraints.</strong> Cap text to N lines, force images to a fixed aspect-ratio container, etc. Every item is the same height and virtualization is trivial. The product cost is real — expanded tweets need a separate detail page rather than inline expansion. This is what news aggregators (Apple News, Google News) often do.</li>
        </ol>

        <p>
          For a Twitter-style feed I would go with strategy 1. For a comment thread under a single tweet (where height variance is smaller and content is more uniform), strategy 3 is fine.
        </p>

        <Callout variant="insight" title="Real numbers from production">
          A non-virtualized feed of 10,000 items in Chrome on a recent Mac: page locks for 4–6 seconds on initial render; subsequent scroll is choppy. A virtualized feed of the same 10,000 items: initial render in ~16ms (one frame), scrolling stays at 60fps even on mid-tier mobile. The difference is so large that virtualization moves from {`"performance optimization"`} to {`"the only way to ship the product."`} If the interviewer asks {`"why virtualize?"`} answer with these numbers.
        </Callout>

        <h2>Image loading — perceived performance lives here</h2>
        <p>
          On an image-heavy feed, the user{`'`}s perception of speed is dominated by image rendering, not data fetching. The data is on the wire in 200ms; the images take another second or two. Three techniques compound:
        </p>

        <h3>Blur-up placeholder (LQIP)</h3>
        <p>
          Low-Quality Image Placeholder: while the full image loads, show a tiny pre-blurred version inline (typically 8–16px wide, expanded with CSS blur). The placeholder is ~200 bytes — embedded in the JSON response, no extra request — and gives the user something visually meaningful while the real image loads.
        </p>

        <CodeBlock lang="tsx" caption="next/image with blur placeholder">{`import Image from "next/image";

function ImageMedia({ media }: { media: { kind: "image" } & ImageMedia }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: \`\${media.width} / \${media.height}\` }}>
      <Image
        src={media.url}
        alt={media.alt ?? \`Photo by @\${authorHandle}\`}
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        placeholder="blur"
        blurDataURL={media.blurDataUrl}
        loading="lazy"
        className="object-cover rounded-lg"
      />
    </div>
  );
}`}</CodeBlock>

        <h3>Lazy-loading with intersection observer (or native loading=&quot;lazy&quot;)</h3>
        <p>
          Don{`'`}t load images that are not visible. The browser-native attribute <code>loading=&quot;lazy&quot;</code> handles this for most cases — the browser delays loading until the image is near the viewport. For more control (start loading earlier than browser default, or sequence loads), an IntersectionObserver wrapper works. <code>next/image</code> uses native lazy by default.
        </p>

        <h3>Aspect-ratio reservation — preventing layout shift</h3>
        <p>
          The most-overlooked one. If you render <code>{`<img src="..." />`}</code> without specifying dimensions, the browser doesn{`'`}t know how tall it will be until the image headers parse. The image pops in, pushing everything below down. This is Cumulative Layout Shift (CLS) and Google penalizes it in Core Web Vitals.
        </p>
        <p>
          Fix: wrap the image in a div with <code>aspect-ratio: 16 / 9</code> (or the image{`'`}s actual ratio, returned from the server). The wrapper claims the right amount of space immediately; the image fills it when loaded; nothing shifts.
        </p>

        <CodeBlock lang="tsx" caption="The CLS-safe image wrapper">{`<div
  style={{ aspectRatio: \`\${media.width} / \${media.height}\` }}
  className="relative w-full overflow-hidden rounded-lg bg-slate-200"
>
  <Image src={media.url} alt={...} fill placeholder="blur" blurDataURL={...} />
</div>

// The bg-slate-200 is a fallback color visible during the blur transition.
// Without aspect-ratio, this image's load triggers reflow and CLS.`}</CodeBlock>

        <h3>Prefetch on hover (desktop)</h3>
        <p>
          On desktop, users move their cursor toward links before clicking. You have ~100–300ms of warning. Use it: <code>onMouseEnter</code> triggers a prefetch of the linked tweet detail (or the linked URL if it{`'`}s an external preview). By the time the user clicks, the data is on the wire or already cached. <code>next/link</code> does this by default for routes; for arbitrary fetches, a manual <code>queryClient.prefetchQuery</code> works.
        </p>

        <Callout variant="spring" title="The number to remember">
          Optimized images on a feed page can drop LCP (Largest Contentful Paint) by 1–2 seconds. That is the difference between a feed that feels slow and one that feels fast. Image work is the single highest-leverage perceived-perf intervention on this design.
        </Callout>

        <Quiz
          question="Why does virtualization matter for a 10,000-item feed?"
          options={[
            { label: "10k items × ~8 DOM nodes each = 80k nodes. Browser layout, paint, and resize ops walk every node and bog down at this scale; memory pressure on mobile triggers tab kills. Virtualization keeps ~30 items in the DOM at any time so layout stays bounded.", correct: true, explanation: "Right. The argument is mechanical: layout cost grows with node count, and 80k nodes is past the cliff for most browsers, especially on mobile." },
            { label: "Virtualization is required by React for any list over 1000 items.", explanation: "React has no such requirement. Virtualization is a runtime / performance choice, not an API constraint." },
            { label: "It reduces network requests.", explanation: "Virtualization is about DOM nodes, not network. Pagination is the network lever." },
            { label: "It improves SEO.", explanation: "Virtualization can hurt SEO if items are not in the DOM for crawlers. The argument is performance, with a separate strategy for SEO." },
          ]}
          hint="What is the bottleneck — network or layout?"
          xp={6}
        />

        <Quiz
          question="What is the trickiest part of virtualizing a feed compared to a fixed-height list?"
          options={[
            { label: "Items have variable heights (short text vs image-heavy vs quoted-tweet) and you do not know the height until render. The library has to estimate, render, measure, and adjust geometry on the fly — and a wrong estimate causes scrollbar jumps that feel broken.", correct: true, explanation: "Right. Variable-height is the load-bearing complexity. Estimate-and-measure is the standard approach; pre-computing server-side or imposing fixed heights are the alternatives." },
            { label: "React's reconciler does not support virtualization.", explanation: "It does — most virtualization libs are pure React. The complexity is in the geometry, not the framework." },
            { label: "Scroll restoration breaks with virtualization.", explanation: "Scroll restoration is a separate concern — you save the scroll offset (or the focused item ID) and restore it. Virtualization libs handle this." },
            { label: "Virtualized items cannot have animations.", explanation: "They can — animations live inside the rendered slice. Animations on items that have scrolled out are not visible anyway." },
          ]}
          hint="What is invariant in fixed-height lists that is not invariant in feeds?"
          xp={6}
        />

        <Quiz
          question="Why specify aspect-ratio on the image wrapper?"
          options={[
            { label: "Without explicit dimensions, the browser does not know how tall the image will be until headers parse — the image pops in and pushes content below it down. That layout shift hurts CLS (Core Web Vitals) and feels broken. aspect-ratio reserves the slot immediately.", correct: true, explanation: "Right. CLS is the visible symptom; the underlying issue is that images are 'unknown size' until loaded, and the browser cannot reserve their space without a hint." },
            { label: "It improves image compression.", explanation: "Compression is a server concern; aspect-ratio is purely a layout / CLS fix." },
            { label: "Required by next/image.", explanation: "next/image is happy with width/height props; aspect-ratio is one valid pattern but not 'required.'" },
            { label: "It loads images faster.", explanation: "Speed is unchanged; what changes is the layout stability while the image is loading." },
          ]}
          hint="What happens to the page if the browser does not know how tall an image will be?"
          xp={6}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Virtualization makes long feeds feasible at all; image loading makes them feel fast. The two together are the perceived-perf story for this design."
          points={[
            { takeaway: "Virtualization is mandatory above ~500 items", detail: "10k × 8 nodes = 80k DOM nodes overwhelms layout and memory. ~30 items rendered + spacers preserves geometry." },
            { takeaway: "Variable-height needs estimate + measure-and-adjust", detail: "@tanstack/react-virtual handles it. Pre-compute server-side or impose fixed-height are the alternatives, with their own costs." },
            { takeaway: "Three image techniques compound: LQIP, lazy, aspect-ratio", detail: "Blur-up gives instant feedback; lazy avoids loading offscreen; aspect-ratio reservation prevents CLS. next/image bundles them." },
            { takeaway: "Image work is the highest-leverage perceived-perf intervention", detail: "1–2s of LCP improvement is on the table. Spend the budget here before tuning anything else." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="complete" title="Part 4 · Optimistic + offline + accessibility + edge cases" xp={25}>
        <h2>Optimistic likes — the contract</h2>
        <p>
          The user taps the heart. The heart fills instantly, the count goes up. Behind the scenes, a request is in flight. The server might fail (network error, rate limit), the user might be a stale session, or the like might already exist (idempotency). The UI cannot wait for the round trip to resolve before responding — that would feel slow — but it cannot ignore the result either.
        </p>
        <p>
          The pattern is: <strong>update locally, send the mutation, reconcile when the result arrives.</strong> React Query{`'`}s mutation lifecycle has the exact hooks for this:
        </p>

        <CodeBlock lang="tsx" caption="hooks/useLikeMutation.ts">{`import { useMutation, useQueryClient } from "@tanstack/react-query";

type LikeArgs = { itemId: string; mutationId: string };

async function postLike({ itemId, mutationId }: LikeArgs): Promise<{ liked: boolean; likes: number }> {
  const res = await fetch(\`/api/tweets/\${itemId}/like\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": mutationId,
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error(\`Like failed: \${res.status}\`);
  return res.json();
}

export function useLikeMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: postLike,

    // Run BEFORE the network call. Update the cache and stash a snapshot
    // for rollback. Returning a value here passes it to onError.
    onMutate: async ({ itemId, mutationId }) => {
      await qc.cancelQueries({ queryKey: ["feed"] });

      const snapshot = qc.getQueryData(["feed"]);

      qc.setQueryData<FeedPagesData>(["feed"], (old) => {
        if (!old) return old;
        return mapItem(old, itemId, (item) => ({
          ...item,
          viewerLiked: true,
          stats: { ...item.stats, likes: item.stats.likes + 1 },
          pendingLike: {
            mutationId,
            previousValue: item.viewerLiked,
            previousCount: item.stats.likes,
          },
        }));
      });

      return { snapshot };
    },

    // Server said no. Restore the snapshot.
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(["feed"], ctx.snapshot);
      // Surface a toast: "Couldn't like — try again"
    },

    // Server said yes. Reconcile with the canonical value.
    onSuccess: (data, { itemId }) => {
      qc.setQueryData<FeedPagesData>(["feed"], (old) => {
        if (!old) return old;
        return mapItem(old, itemId, (item) => ({
          ...item,
          viewerLiked: data.liked,
          stats: { ...item.stats, likes: data.likes },
          pendingLike: undefined,
        }));
      });
    },
  });
}

// mapItem walks the paged structure and applies fn to the matching item.
// Implementation omitted here — straightforward immutable update.`}</CodeBlock>

        <p>
          A few details worth calling out:
        </p>
        <ul>
          <li><strong>The mutation ID is client-generated</strong> (typically a UUID per click). It goes in an <code>Idempotency-Key</code> header so the server can dedupe replays. If the network drops mid-request and we retry, the server sees the same key and returns the previous result rather than incrementing twice.</li>
          <li><strong><code>cancelQueries</code> in onMutate prevents an in-flight refetch</strong> from stomping our optimistic update. Without it, you can race: optimistic update writes <code>viewerLiked: true</code>, refetch lands with the old <code>viewerLiked: false</code>, user sees the heart un-fill briefly.</li>
          <li><strong>The pendingLike field tracks the rollback state.</strong> If the user fires three likes/unlikes rapidly, each click stashes the previous values; on failure of any one, we restore the snapshot from before that click.</li>
          <li><strong>onSuccess uses the server response, not the optimistic value.</strong> If the server says the count is now 1,847 (not 1,803 like our optimistic increment guessed — because three other people also liked it in the same window), we adopt the server value. This is reconciliation.</li>
        </ul>

        <h2>The deeper point — the API has to support this</h2>
        <p>
          Optimistic updates are not a pure client-side technique. They are a contract with the server. The server has to:
        </p>
        <ul>
          <li><strong>Return the canonical value</strong> after a mutation, not just success/failure. {`"OK"`} is not enough — we need to reconcile drift, which requires knowing what the value actually is now.</li>
          <li><strong>Honor idempotency keys</strong> so retries are safe. Without this, a network blip plus an automatic retry double-likes.</li>
          <li><strong>Validate authority server-side</strong> regardless of what the client claims. The client says {`"viewerLiked: true"`} — the server still checks who the user is and decides whether the like is valid.</li>
        </ul>
        <p>
          If the server returns only <code>200 OK</code>, the client is guessing. The optimistic increment is whatever you think it is — but if your guess drifts from reality (because of caching, fanout delay, multi-device usage), the user will see wrong counts until the next refetch papers over the drift. This ties back to the API design module: if you control both sides, design the mutation response to support optimistic update reconciliation.
        </p>

        <h2>Image loading edge case — slow networks</h2>
        <p>
          What if the user{`'`}s network is bad and the like POST takes 8 seconds to fail? The heart has been filled for 8 seconds. We have two options: (a) trust the optimistic state until failure, (b) revert if the request hasn{`'`}t resolved in N seconds and surface a {`"trying to like"`} state.
        </p>
        <p>
          (a) is cleaner. The mental model {`"my action took effect"`} is correct in 99% of cases; the rollback handles the rest. (b) introduces a third state (pending) that adds visual complexity for a marginal correctness win. Twitter, Instagram, and basically every modern app picks (a).
        </p>

        <h2>Offline read — what is hard, what is not</h2>
        <p>
          Offline read sounds harder than it is. The architecture is straightforward; the discipline is in choosing what to cache and how to communicate state to the user.
        </p>

        <h3>The pieces</h3>
        <ul>
          <li><strong>IndexedDB</strong> stores the last-loaded feed pages. (Why IndexedDB and not localStorage? IndexedDB has higher quota — typically 50%+ of disk — and supports structured data + async access. localStorage maxes out around 5–10MB and is sync.)</li>
          <li><strong>Service Worker</strong> intercepts <code>fetch</code> calls. For <code>/api/feed</code> reads, it follows a cache-first strategy backed by IndexedDB.</li>
          <li><strong>React Query persistence plugin</strong> can hydrate the cache from IndexedDB on app boot, so the user sees the last-loaded items immediately on a cold start while offline.</li>
        </ul>

        <CodeBlock lang="ts" caption="service-worker.ts — the read handler">{`// Stale-while-revalidate for /api/feed reads
self.addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith("/api/feed")) return;
  if (event.request.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open("feed-v1");
    const cached = await cache.match(event.request);

    // Kick off the network request; revalidate in the background
    const networkPromise = fetch(event.request).then(async (res) => {
      if (res.ok) cache.put(event.request, res.clone());
      return res;
    }).catch((err) => {
      // Network failed; if we had no cache, this surfaces to the client
      if (!cached) throw err;
      return cached;
    });

    // Return cached immediately if we have it; otherwise wait on network
    return cached ?? networkPromise;
  })());
});`}</CodeBlock>

        <h3>What about mutations while offline?</h3>
        <p>
          Two strategies. Pick one and be explicit:
        </p>
        <ol>
          <li><strong>Queue and replay.</strong> Mutations (like, retweet, reply) are written to a local queue. When the network returns, the service worker replays them in order. This requires server-side idempotency (we already have it) and a way to surface conflicts (the tweet was deleted while you were offline). Higher complexity, higher quality UX.</li>
          <li><strong>Fail loudly.</strong> Mutations require network; if the network is offline, the action fails and the UI surfaces {`"You're offline — try again when you reconnect."`} Lower complexity, lower quality UX.</li>
        </ol>
        <p>
          For Twitter-class products, queue-and-replay is the right choice for likes and retweets (low-stakes, idempotent). For things with side effects you can{`'`}t un-do — like {`"send DM"`} — fail loudly is better, because a queued DM that fires 20 minutes later when the network returns is confusing.
        </p>

        <h3>The {`"sync when online"`} UX — do not silently swallow</h3>
        <p>
          If a mutation fails because the user is offline and gets queued, <strong>tell them.</strong> A persistent banner that reads {`"Offline — 3 actions queued"`} sets the right mental model. When the network returns and the queue replays, swap to {`"Synced."`} for 2 seconds, then hide.
        </p>
        <p>
          The anti-pattern is silently queuing and surfacing nothing. The user fires off a like, sees the heart fill, walks into the subway, comes out 30 minutes later, and has no idea whether their actions made it. Trust is gone.
        </p>

        <Callout variant="warn" title="When NOT to bother with offline">
          B2B internal tools where the user expects to be online to use them. Anything where stale data is dangerous (trading apps, ops dashboards). Anything with strict consistency requirements (banking transactions). The cost of offline is real — not just engineering, but ongoing maintenance of the cache invalidation rules — and it is worth skipping if the product can.
        </Callout>

        <h2>Accessibility — the senior signal that everyone forgets</h2>
        <p>
          Accessibility is the area where senior frontend candidates separate from mid-level. Mid-level candidates don{`'`}t mention it. Senior candidates have a checklist they hit by reflex. Here is mine.
        </p>

        <h3>Semantic HTML</h3>
        <ul>
          <li><strong>Each FeedItem is an <code>{`<article>`}</code></strong>, not a <code>{`<div>`}</code>. Screen readers announce {`"article, 1 of many"`} which gives users orientation.</li>
          <li><strong>Action buttons are <code>{`<button>`}</code></strong>, not <code>{`<div onClick>`}</code>. <code>{`<button>`}</code> is keyboard-focusable, fires on space and enter, and announces correctly. <code>{`<div>`}</code> with onClick requires manually adding <code>tabIndex</code>, key handlers, and ARIA — and you will get one of them wrong.</li>
          <li><strong>Time uses <code>{`<time datetime="...">`}</code></strong>. Screen readers can read either the formatted or the machine-readable form; assistive tech can re-format.</li>
        </ul>

        <h3>The new-posts indicator is a live region</h3>
        <p>
          When polling brings news of new tweets, sighted users see the {`"42 new tweets"`} button appear. Screen reader users need an announcement. The indicator should be wrapped in <code>aria-live=&quot;polite&quot;</code> so the screen reader announces the change.
        </p>

        <CodeBlock lang="tsx" caption="NewPostsIndicator with a11y">{`function NewPostsIndicator({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return null;
  return (
    <div aria-live="polite" aria-atomic="true">
      <button onClick={onClick} className="...">
        {count === 1 ? "1 new post" : \`\${count} new posts\`}
      </button>
    </div>
  );
}`}</CodeBlock>

        <h3>Focus management</h3>
        <p>
          When a modal opens (e.g. retweet quote, reply composer):
        </p>
        <ul>
          <li><strong>Move focus into the modal</strong> — usually to the first focusable element or a labeled close button.</li>
          <li><strong>Trap focus within the modal</strong> — Tab cycles through modal contents; it does not escape to the page below. Libraries like <code>focus-trap-react</code> exist; on a feed where only one modal is open at a time, ~30 lines of custom code does it.</li>
          <li><strong>Restore focus on close</strong> — when the modal closes, focus returns to the trigger element (the retweet button on the original tweet). Without this, focus reverts to the document, and a keyboard user is suddenly at the top of the page.</li>
        </ul>

        <h3>Image alt text</h3>
        <ul>
          <li><strong>Alt text comes from the API</strong> — the upload UI lets the author add it. Most users skip it (real number: ~5% adoption), but it is the right architecture.</li>
          <li><strong>Fall back to a meaningful default</strong>: <code>{`"Photo by @\${authorHandle}"`}</code>. Better than empty, worse than human-written, honest about what we know.</li>
          <li><strong>Decorative images get <code>alt=&quot;&quot;</code></strong> — explicitly empty, not missing. Empty alt tells screen readers to skip; missing alt is read aloud as the URL.</li>
        </ul>

        <h3>Keyboard navigation</h3>
        <p>
          Power users on Twitter use J/K to move between tweets, L to like, R to reply. This is genuinely good — it makes the feed usable without a mouse. The implementation:
        </p>

        <CodeBlock lang="tsx" caption="hooks/useFeedKeyboardNav.ts">{`import { useEffect, useState } from "react";

export function useFeedKeyboardNav(itemCount: number) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "j") setFocusedIndex((i) => Math.min(i + 1, itemCount - 1));
      else if (e.key === "k") setFocusedIndex((i) => Math.max(i - 1, 0));
      else if (e.key === "Enter") {
        // open the focused tweet
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [itemCount]);

  return focusedIndex;
}`}</CodeBlock>

        <p>
          The focused item gets a visible focus ring (use the existing <code>:focus-visible</code> styles, do not invent new ones), and the virtualizer scrolls it into view via <code>scrollToIndex(focusedIndex)</code>.
        </p>

        <h2>Edge cases the interviewer probes</h2>

        <h3>What if the API is slow?</h3>
        <p>
          On the first load, before any data is in the cache, the user stares at a blank screen for 800ms. That is too long. Show a <strong>skeleton screen</strong> — the gray-box outline of feed items, animated with a subtle shimmer. When data arrives, fade in over 150ms.
        </p>
        <p>
          Skeletons are not loading spinners; they communicate {`"content is loading and here is its shape."`} The user{`'`}s eye relaxes because they know what is coming. Spinners communicate {`"something is happening, but I can{'}'} t tell you what."`}
        </p>

        <h3>What if the user has zero follows?</h3>
        <p>
          The API returns <code>{`{ items: [], hasMore: false }`}</code>. The UI must not render a blank screen — it should render an <strong>empty state</strong> with onboarding: {`"Follow some accounts to see tweets here. Suggested: ..."`} with three or four suggested accounts. Empty states are a real product surface, not a bug.
        </p>

        <h3>Scroll restoration on back-nav</h3>
        <p>
          User is reading the feed, scrolled to position 4,200px. They tap a tweet, read the detail, hit back. They expect to land at 4,200px, not at the top.
        </p>
        <p>
          Next.js App Router does this for you if you let it — keep the layout stable across the navigation, don{`'`}t fully unmount the feed page. For more control: store <code>{`{ scrollTop, focusedItemId }`}</code> in <code>sessionStorage</code> on navigation away, and on return, scroll the virtualizer to the right position by index.
        </p>

        <h3>Concurrent likes from another device</h3>
        <p>
          User likes a tweet on their phone, opens the same feed in the browser. The browser cache says <code>viewerLiked: false</code>; the server says <code>viewerLiked: true</code>. Who wins?
        </p>
        <p>
          Server is the source of truth. On next refetch, the server value lands in the cache and the heart fills. If the gap matters (it usually doesn{`'`}t), polling at 30–60s narrows the inconsistency window. For likes specifically, this is fine — likes are commutative and the user sees the right answer within a minute. For something like a draft tweet, you would need explicit conflict resolution (last-writer-wins, or a merge UI).
        </p>

        <h3>Duplicate items across pages</h3>
        <p>
          Even with cursor pagination, occasional duplicates can sneak in (server-side dedup bug, ranking shuffle). The client should dedup by item ID when flattening pages — never trust the wire to be perfectly clean.
        </p>

        <CodeBlock lang="ts" caption="Defensive dedup">{`function flattenAndDedup(pages: FeedPage[]): FeedItem[] {
  const seen = new Set<string>();
  const result: FeedItem[] = [];
  for (const page of pages) {
    for (const item of page.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}`}</CodeBlock>

        <Quiz
          question="Why does an optimistic update need a client-generated mutation ID and an Idempotency-Key header?"
          options={[
            { label: "Network blips cause retries. Without an idempotency key, a retry that succeeds after the original also succeeded results in a double-mutation (two likes, two retweets). The mutation ID lets the server dedupe — the second request returns the previous result rather than re-applying the change.", correct: true, explanation: "Right. Idempotency is an at-least-once-delivery problem. The client retries; the key turns at-least-once into effectively-once on the server." },
            { label: "It improves request caching at the CDN.", explanation: "Mutations are not cached at the CDN. Idempotency is about server-side dedup, not network caching." },
            { label: "It is required by the React Query API.", explanation: "React Query has no such requirement. Idempotency is a property of the server contract, which the mutation must respect." },
            { label: "It speeds up the response.", explanation: "Speed is not the argument. Correctness under retry is." },
          ]}
          hint="What happens if the network drops the response, the client retries, and both requests reach the server?"
          xp={6}
        />

        <Quiz
          question="The mutation onSuccess uses the server's returned values, not the client's optimistic guess. Why?"
          options={[
            { label: "The optimistic increment is a guess. The server is the source of truth — other users may have liked the same tweet during the round trip, so the canonical count differs from the +1 we assumed. Adopting the server value keeps the client converged with reality.", correct: true, explanation: "Right. Reconciliation is the whole point of returning the canonical value from a mutation. Optimism is for perceived speed; the server response is for correctness." },
            { label: "The client cannot do arithmetic.", explanation: "Of course it can. The point is that the client's arithmetic is on incomplete information." },
            { label: "React Query mandates this.", explanation: "It does not. The pattern is your design choice, motivated by reconciling drift." },
            { label: "It saves a refetch.", explanation: "True as a side effect, but the load-bearing reason is correctness, not request count." },
          ]}
          hint="If three other people like the tweet during your 200ms round-trip, what does your optimistic +1 miss?"
          xp={6}
        />

        <Quiz
          question="Why use IndexedDB rather than localStorage for offline feed cache?"
          options={[
            { label: "IndexedDB has higher quota (typically 50%+ of disk vs ~5–10MB), supports structured data and async access, and is built for the kind of object-graph storage a feed cache needs. localStorage is small, sync (blocks the main thread), and string-only.", correct: true, explanation: "Right. The combination of quota, async, and structured data is what makes IndexedDB the right tool. localStorage is fine for tiny key-value preferences but breaks down at feed-cache scale." },
            { label: "localStorage is deprecated.", explanation: "It is not deprecated. The argument is fitness — quota, async, and structure — not deprecation." },
            { label: "IndexedDB is faster.", explanation: "Per-op latency is comparable; the structural advantages dominate." },
            { label: "Service workers cannot access localStorage.", explanation: "True (service workers don't have localStorage), but that is one consequence of the larger fitness argument, not the load-bearing reason." },
          ]}
          hint="A few hundred feed items is megabytes of structured data. Where does that fit?"
          xp={5}
        />

        <Quiz
          question="Why is each FeedItem an <article> rather than a <div>?"
          options={[
            { label: "Screen readers announce <article> as a self-contained unit and provide navigation between them — 'article, 1 of many.' A <div> conveys nothing semantically, so the user has no orientation in a long list.", correct: true, explanation: "Right. Semantic HTML is free accessibility — the right tag carries the right meaning to assistive tech without you doing extra work." },
            { label: "<article> renders faster than <div>.", explanation: "Render speed is identical. The difference is semantic, not performance." },
            { label: "<div> is deprecated for content.", explanation: "It is not. The point is fitness, not deprecation." },
            { label: "<article> is required by HTML validators.", explanation: "Validators don't require it; semantics do." },
          ]}
          hint="Who is at a disadvantage if every item is a div?"
          xp={5}
        />

        <Quiz
          question="On focus management when a modal opens: what is the senior-level checklist?"
          options={[
            { label: "Move focus into the modal on open, trap it inside while open, and restore focus to the trigger element on close. Without these, keyboard users find themselves at the top of the page when the modal closes.", correct: true, explanation: "Right. Three pieces. Skipping any of them breaks keyboard nav in a way that is silent for sighted mouse users and obvious for everyone else." },
            { label: "Move focus into the modal on open. Nothing else is needed.", explanation: "Missing the trap means Tab escapes to the page beneath, and missing the restore means focus is lost on close." },
            { label: "Hide the page beneath with aria-hidden=true.", explanation: "That is part of a broader strategy (and has caveats — you'll hide focused elements). The three-step checklist is the load-bearing answer." },
            { label: "Disable Tab entirely while the modal is open.", explanation: "That breaks keyboard navigation inside the modal too. Trap, don't disable." },
          ]}
          hint="What does the keyboard user do once the modal is open? What about when it closes?"
          xp={6}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Optimistic updates require a contract with the server (canonical responses + idempotency). Offline read is straightforward in architecture but disciplined in cache and UX rules. Accessibility is a checklist a senior candidate runs by reflex. Edge cases — empty states, scroll restoration, multi-device — are part of a complete answer."
          points={[
            { takeaway: "Optimistic updates are a server contract", detail: "Client-generated mutation ID + Idempotency-Key for retry safety. Server returns canonical value for reconciliation. onMutate / onError / onSuccess handle the lifecycle." },
            { takeaway: "Offline read = service worker + IndexedDB + cache-first", detail: "Stale-while-revalidate for reads. Mutations queue (likes/retweets) or fail loudly (DMs). Tell the user what state they are in." },
            { takeaway: "Accessibility checklist: semantics, live regions, focus, alt, keyboard", detail: "<article> per item, aria-live on indicator, focus trap + restore in modals, alt from API with fallback, J/K nav for power users." },
            { takeaway: "Edge cases: skeleton on slow load, empty state, scroll restore, multi-device drift", detail: "Skeletons not spinners. Empty states are real surfaces. Server is source of truth for cross-device. Defensive dedup by item ID." },
          ]}
        />
      </Checkpoint>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <p className="text-sm uppercase tracking-wider font-bold text-cyan-700 dark:text-cyan-300 mb-2">Up next</p>
        <p className="m-0 text-base">
          Module 42: Design a real-time chat UI. Same framework, different archetype — message ordering under flaky networks, presence and typing indicators, scroll-to-bottom semantics, and why message lists are virtualized differently than feeds.
        </p>
      </section>
    </article>
  );
}
