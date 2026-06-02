# Skillforge

Hands-on, project-driven courses for working engineers. The whole thing is a Next.js app you run locally — every module is a single page with embedded quizzes, worked examples, code exercises, and gating checkpoints. Progress is tracked in localStorage. There's a mascot called Tokey.

## Tracks

Four tracks, all live today:

- **AI Engineering Foundations** — *available now.* From zero ML background to shipping production AI features (Java / Spring / React / GraphQL). 33 modules across 6 phases (plus orientation).
- **Data Structures and Algorithms** — *available now.* Pattern-first LeetCode prep, in Java, for engineers returning to interview prep after years away. 43 modules across 8 phases (plus orientation).
- **System Design** — *available now.* Distributed systems, layered — fundamentals → patterns → real designs, with Java/Spring labs throughout. 50 modules across 8 phases (plus orientation).
- **Frontend Engineering** — *available now.* From basic React to engineer-ready front-end (JavaScript, TypeScript, React, Next.js App Router, interview prep). 57 modules across 9 phases (plus orientation).

The home page is a course picker; pick a track and dive in. Module and phase counts are derived dynamically from each course's data file in `lib/courses/` — the numbers above are the current totals.

## Pedagogy

The platform is opinionated. Every concept follows the same five-step contract:

1. **Analogy** — the intuition, before any math
2. **Formula (or pattern)** — with every symbol explained
3. **Worked example** — by hand, with actual numbers (or a fully traced LeetCode problem)
4. **Variants** — what changes in practice, and why
5. **Checkpoint** — a quiz that gates progress

A checkpoint only clears when you can do three things: explain the idea in two minutes, recognize it in code you didn't write, and implement it from scratch (in Java for the AI, DSA, and System Design tracks; in JavaScript/TypeScript for Frontend). Quizzes enforce this — you don't progress by clicking "next," you progress by answering correctly.

## Curricula

Every module ships with a hands-on project — theory-only courses don't stick. The per-course breakdowns below are the current syllabus; the authoritative source for each is its data file in `lib/courses/<id>.ts`, and the in-app course pages derive their counts from there.

## AI Engineering Foundations — curriculum

33 modules across 6 phases (plus orientation). All available today. Most projects are Java/Spring builds you do alongside the reading.

**Phase 0 · Orientation**

0. Welcome — what this course is (and isn't), how to get the most out of it

**Phase 1 · ML & AI Foundations**

1. Tokenization — why the AI charges you by the tokwhat?
2. Supervised learning foundations — problem types, features, labels, loss
3. How models actually learn — gradient descent, LR tuning, overfitting, evaluation metrics
4. Neural networks — layers, activations, backprop from intuition up
5. Attention & transformers — the one idea that ate the ML world
6. Embeddings: numbers become geometry — vector space, cosine similarity, why semantic search works
7. Prompt engineering — system prompts, few-shot, chain-of-thought, structured output
8. Phase 1 revision notes — trace a real LLM request through every concept from Modules 1–7

**Phase 2 · API & Backend Integration**

9. Claude API fundamentals — auth, models, parameters
10. Spring AI integration — the Spring-native way to call LLMs
11. Tool use & function calling — let the LLM call your GraphQL resolvers
12. Streaming with SSE — token-by-token from Spring Boot to React
13. Prompt caching & cost — running LLMs at production scale
14. Phase 2 revision notes — Claude API, Spring AI, tool use, streaming, prompt caching

**Phase 3 · Vector Search & RAG**

15. Embeddings deep dive — production embedding models, dimensions, cost, the curse
16. Vector DBs & pgvector — HNSW vs IVFFlat, indexing, Postgres integration
17. RAG architecture — chunking, retrieval, context assembly
18. RAG in Spring Boot end-to-end — Spring AI + pgvector, full pipeline
19. Phase 3 revision notes — embeddings, pgvector, RAG architecture, the Spring AI pipeline

**Phase 4 · Frontend AI Integration**

20. React streaming patterns — SSE consumption, optimistic updates, tool results
21. Full chat interface — React + GraphQL + Spring Boot end-to-end
22. Multimodal inputs — images, files, vision models
23. Phase 4 revision notes — SSE consumption, chat UI patterns, multimodal

**Phase 5 · Agents & Advanced Patterns**

24. Agent fundamentals — ReAct loop, memory, when NOT to use agents
25. Agents in Spring Boot — tool loop, state, stopping conditions
26. Multi-agent patterns — orchestrator/subagent, parallelization
27. Phase 5 revision notes — ReAct, agent loops in Spring, multi-agent orchestration

**Phase 6 · Production & Capstone**

28. Evals — LLM-as-judge, golden sets, regression testing
29. Security & guardrails — prompt injection, PII, output filtering
30. Fine-tuning & RLHF — when to bother, and why RAG usually wins
31. Phase 6 revision notes — evals, security/guardrails, fine-tuning vs RAG
32. Capstone project — end-to-end AI engineering assistant

## Data Structures and Algorithms — curriculum

43 modules across 8 phases (plus orientation). All available today. Pattern-first, in Java, with LeetCode problems and from-scratch implementations as the projects.

**Phase 0 · Orientation**

0. Welcome — how this course works: pattern-first prep, LeetCode as a gym, and how checkpoints gate progress

**Phase 1 · Complexity & the Mental Model**

1. Big-O from zero — growth rates, why we ignore constants, and the 7 curves you'll meet
2. Space complexity & the call stack — auxiliary vs total space, why recursion costs memory, JVM stack vs heap
3. Best, average, worst & amortized analysis — why `ArrayList.add` is O(1) on average, and when worst-case matters
4. Phase 1 revision notes — the whole Big-O / space / amortized story on one reference card

**Phase 2 · Linear Data Structures**

5. Arrays & dynamic arrays — fixed vs dynamic, the doubling trick, ArrayList internals, prefix sums
6. Strings & string building — immutability, why `+` in a loop is a trap, StringBuilder, char[] tricks
7. Linked lists (singly, doubly, circular) — node-and-pointer model, dummy-head trick, fast/slow pointers
8. Stacks — LIFO, the call stack analogy, monotonic stacks (preview)
9. Queues & deques — FIFO, circular buffers, ArrayDeque (the one you should actually use)
10. Phase 2 revision notes — arrays, strings, linked lists, stacks, queues

**Phase 3 · Hashing & Trees**

11. Hash tables & HashMap — hash functions, collisions, Java's HashMap internals, why equals/hashCode matter
12. Sets & frequency counting patterns — HashSet vs TreeSet, the count-then-check pattern
13. Trees & binary trees — terminology, recursive structure, preorder/inorder/postorder by hand
14. Binary search trees & balanced trees — BST invariants, why unbalanced degrades to O(n), AVL/Red-Black, TreeMap
15. Heaps & priority queues — array-backed heap mechanics, sift-up/down, the top-K pattern
16. Phase 3 revision notes — hashing, sets, trees, BSTs, heaps

**Phase 4 · Graphs**

17. Graph fundamentals & representations — directed/undirected, weighted/unweighted, adjacency list vs matrix
18. BFS & DFS — the two traversals, recursive vs iterative DFS, when BFS gives shortest path
19. Shortest path & topological sort — Dijkstra, unweighted shortest path, Kahn's algorithm, cycle detection
20. Phase 4 revision notes — graph representations, BFS/DFS, shortest path, topological sort

**Phase 5 · Java Collections in Depth**

21. Java Collections Framework deep dive — the hierarchy, Big-O cheat sheet, Comparator vs Comparable
22. Phase 5 revision notes — pick-the-right-collection

**Phase 6 · Algorithmic Techniques**

23. Two pointers — opposite-end vs same-direction, the sorted-array tell
24. Sliding window (fixed & variable) — when to expand vs contract, the invariant, the frequency-map combo
25. Binary search & answer-search pattern — the off-by-one minefield, lower/upper bound, binary-searching the answer
26. Sorting algorithms — bubble/selection/insertion for intuition, merge + quick for real, Arrays.sort internals
27. Recursion & divide-and-conquer — the recursion contract, base-case discipline, the recurrence-relation shortcut
28. Backtracking — choose / explore / unchoose, pruning, when backtracking is just stateful DFS
29. Greedy algorithms — when greedy works (and why it fails when it doesn't), exchange-argument intuition
30. Bit manipulation — the operators you forgot existed, XOR's superpowers, bitmask DP teaser
31. Phase 6 revision notes — two pointers, sliding window, binary search, sorting, recursion, backtracking, greedy, bits

**Phase 7 · Dynamic Programming**

32. DP intuition: memoization & overlapping subproblems — the "I keep recomputing the same thing" tell
33. 1D DP patterns — linear-state DP, the "decision at index i" template
34. 2D DP & grid DP — two-pointer state, the edit-distance family, grid path-counting
35. Advanced DP: intervals, trees, bitmask — when state isn't just an index
36. Phase 7 revision notes — memoization vs tabulation, 1D and 2D state, the DP decision framework

**Phase 8 · Advanced & Interview Prep**

37. Tries — the prefix-tree structure, when a trie beats a hashmap, autocomplete intuition
38. Union-Find (Disjoint Set Union) — path compression, union by rank, Kruskal's MST application
39. Advanced graph: MST, Bellman-Ford, Floyd-Warshall — negative weights, all-pairs shortest paths
40. Interview problem-solving framework — UMPIRE, pattern recognition, communicating while you code
41. Capstone: 20-problem mixed set — a curated mixed-pattern problem set
42. Phase 8 revision notes — tries, Union-Find, advanced graph, UMPIRE

## System Design — curriculum

50 modules across 8 phases (plus orientation). All available today. Worked design exercises plus Java/Spring labs (gateways, caching, consistent hashing, observability).

**Phase 0 · Orientation**

0. Welcome — how this course works: layered system design, interview vs production

**Phase 1 · Foundations**

1. Back-of-envelope estimation — latency numbers every engineer should know, QPS math, capacity sizing
2. The scaling ladder — vertical → horizontal → stateless → cache → shard → async
3. CAP and PACELC — the real tradeoffs (not the cartoon), and what AP/CP mean in practice
4. Consistency models — strong, eventual, causal, read-your-writes, monotonic
5. Phase 1 revision notes — estimation numbers, scaling ladder, CAP/PACELC, consistency models

**Phase 2 · Storage Layer**

6. SQL vs NoSQL — when each wins; OLTP vs OLAP; the datastore decision tree
7. Indexing deep dive — B-tree vs LSM, covering indexes, when indexes hurt writes
8. Partitioning & sharding — hash, range, directory; consistent hashing; the resharding problem
9. Replication strategies — leader-follower, multi-leader, leaderless, quorums, replication lag
10. Caching patterns — cache-aside, write-through, write-back, refresh-ahead; TTL & invalidation
11. Distributed cache deep dive — Redis patterns in Java, hot keys, thundering herd, cluster vs sentinel
12. Search systems — Elasticsearch/OpenSearch fundamentals, the inverted index, when to bolt search on
13. Phase 2 revision notes — SQL vs NoSQL, indexing, partitioning, replication, caching, search

**Phase 3 · Communication**

14. API design done right — REST, versioning, pagination, idempotency keys, error contracts; gRPC vs REST
15. Spring Cloud Gateway — routing, filters, edge rate-limit, auth offload
16. Message queues — at-least-once vs exactly-once, ordering, DLQs
17. Kafka deep dive — partitions, consumer groups, offsets, exactly-once with Spring Kafka
18. Event-driven & CQRS — pub-sub, event sourcing, CQRS
19. Phase 3 revision notes — API design, gateway, queues, Kafka, event-driven/CQRS

**Phase 4 · Reliability & Operations**

20. Load balancing — L4 vs L7, algorithms (RR/least-conn/EWMA), sticky sessions, health checks
21. Rate limiting — token bucket, leaky bucket, sliding window
22. Resilience4j deep dive — circuit breakers, retries with jitter, bulkheads, timeouts in Spring
23. Idempotency — idempotency keys, dedup tables, retry safety, the at-least-once reality
24. Observability — metrics/logs/traces, OpenTelemetry in Spring, RED/USE, alerting that doesn't suck
25. On-call & incident response — postmortems, runbooks, error budgets
26. Phase 4 revision notes — LB, rate limit, Resilience4j, idempotency, observability, on-call

**Phase 5 · Distributed Systems Deep**

27. Consensus: Raft & Paxos — Raft (deeper), Paxos (high level), when you actually need it, leader election
28. Distributed transactions & sagas — 2PC and why it's avoided, sagas, the outbox pattern
29. Clocks & time in distributed systems — NTP, logical/Lamport clocks, vector clocks, hybrid logical clocks
30. Geo-distributed systems — latency physics, multi-region topologies, CDNs and edge compute
31. Cost & capacity planning — $/QPS, storage tiering, autoscaling, when to over-provision
32. Phase 5 revision notes — consensus, sagas, clocks, geo-distribution, cost

**Phase 6 · Case Studies**

33. The system design interview framework — clarify → estimate → API → data model → high-level → deep dive
34. Design TinyURL — hashing, base62, read-heavy caching, custom aliases
35. Design a news feed — fanout-on-write vs fanout-on-read vs hybrid
36. Design Twitter — newsfeed + search + trending timelines
37. Design a chat system — WebSockets, presence, message ordering, group chat, push
38. Design a distributed rate limiter — Redis-backed token bucket at scale
39. Design a rideshare service — geo-indexing, real-time matching, surge pricing, ETA
40. Design a payment system — idempotency, ledger, reconciliation
41. Phase 6 revision notes — the 6-step framework + 7 design archetypes on one card

**Phase 7 · Production & Capstone**

42. Migration patterns — strangler fig, dual writes, backfills, online schema changes, blue-green vs canary
43. Security at scale — auth/authz, JWT vs sessions, secrets management, defense in depth
44. Course recap — the full mental model, decision frameworks, what to internalize
45. Capstone: design a code review platform — end-to-end design

**Phase 8 · Frontend System Design**

46. Frontend system design fundamentals — rendering strategies (SSR/SSG/ISR/CSR), Core Web Vitals, bundle budgets
47. Design a feed UI — virtualization, infinite scroll, optimistic updates, image loading
48. Design a real-time UI — WebSocket vs SSE, reconnect/backoff, presence, multi-tab sync, CRDT intuition
49. Phase 8 revision notes — rendering strategies, feed UI patterns, real-time UI

## Frontend Engineering — curriculum

57 modules across 9 phases (plus orientation). All available today. Projects lean on from-scratch implementations (debounce/throttle, a tiny Promise, `Promise.all`, custom hooks) and interview-style coding challenges.

**Phase 0 · Orientation**

0. Welcome — what this course is (and isn't), how to use checkpoints under interview pressure

**Phase 1 · JavaScript You Can Defend**

1. Values, references, and what `===` actually compares — primitives vs objects, why `[1] !== [1]`, spread bugs
2. Closures, scope, and the `var` graveyard — lexical scope, the closure-in-a-loop classic, the closures in every hook
3. `this`, binding, and arrow functions — the four rules, why arrows have no `this`, the `.bind()` pattern
4. Prototypes, classes, and what `new` actually does — the prototype chain, why `class` is sugar, `instanceof`
5. The event loop, microtasks, and macrotasks — why `Promise.resolve().then` beats `setTimeout(0)`, React batching
6. Promises, async/await, and the patterns interviewers ask about — states, error propagation, all/race/allSettled, AbortController
7. Modules, bundlers, and what ships to the browser — ESM vs CommonJS, tree-shaking, code-splitting, reading a bundle
8. Phase 1 revision notes — values/refs, closures, `this`, prototypes, the event loop, async, modules

**Phase 2 · TypeScript for React Engineers**

9. TypeScript foundations — structural typing, `type` vs `interface`, and the `any`/`unknown`/`never` set
10. Narrowing, discriminated unions, and exhaustiveness — narrowing in an `if`, state machines, the `never` check
11. Generics — the real mental model: `<T>`, constraints, inference, and the patterns React forces
12. Utility types & type-level transformations — `Partial`/`Pick`/`Omit`/`Record`, mapped/conditional types, `infer`
13. Typing React — props, children, refs, events, `forwardRef`, and the polymorphic `as` prop
14. Phase 2 revision notes — structural typing, narrowing, generics, the React-specific patterns

**Phase 3 · React Mental Model**

15. How React actually works — reconciliation, the virtual DOM, and why keys matter (index-as-key is a trap)
16. Rendering rules — when does a component actually re-render? `memo`, `useMemo`/`useCallback`, premature memoization
17. State rules — `useState`, immutability, the functional updater, batching, lift vs colocate
18. `useEffect` properly — effects as synchronization, the deps array as closure capture, cleanup, StrictMode double-fires
19. Composition patterns — children, render props, compound components, why composition beats configuration
20. Phase 3 revision notes — reconciliation, rendering rules, state, effects, composition

**Phase 4 · Hooks in Depth**

21. `useState` internals & `useReducer` — the snapshot-and-queue model, when to graduate to a reducer
22. `useContext` — without the provider hell or the re-render storms; splitting state/dispatch contexts
23. `useRef` & `useImperativeHandle` — the escape hatch from state; DOM refs, focus/scroll/measure patterns
24. Custom hooks — the real unit of reuse; sharing logic vs sharing state, return-shape conventions
25. The rules of hooks — and the linked-list reason they exist; what `eslint-plugin-react-hooks` protects
26. Phase 4 revision notes — `useState`/`useReducer`, `useContext`, refs, custom hooks, the rules of hooks

**Phase 5 · State, Forms & Data**

27. Controlled vs uncontrolled inputs — who owns the value, why a `value` with no `onChange` freezes the field
28. Form state & validation — timing, errors, touched/dirty, what react-hook-form actually buys you
29. Data fetching in React — the `useEffect` trap, the stale-response race, the `ignore`/`AbortController` fix
30. Server cache is not client state — the React Query mental model: staleness, dedup, invalidation, optimistic updates
31. Where state should live — local, lifted, global, and the URL; context vs Zustand vs Redux, and when each is overkill
32. Phase 5 revision notes — controlled/uncontrolled, forms, data fetching, server cache, state location

**Phase 6 · Advanced React Patterns**

33. Memoization done right — what each of `memo`/`useMemo`/`useCallback` memoizes, and when not to
34. Suspense & concurrent features — `useTransition`, `useDeferredValue`, and why they replace manual `isPending` flags
35. Error boundaries — catching render-time failures (and what they can't catch: events, async, SSR)
36. Portals & advanced ref patterns — modals, tooltips, escaping the tree, focus trapping, ref merging
37. Advanced composition — slots, polymorphism, the `asChild` pattern, headless components
38. Phase 6 revision notes — memoization, Suspense, error boundaries, portals & refs, advanced composition

**Phase 7 · Next.js (App Router) Essentials**

39. Server Components vs Client Components — what runs where, the `"use client"` boundary, the serialization rule
40. File-based routing, layouts, and the loading/error conventions — nested layouts, dynamic segments, route groups
41. Data loading on the server — `async` Server Components, the `fetch` cache and `revalidate`, parallel vs sequential
42. Server Actions & mutations — `"use server"`, progressive enhancement, `revalidatePath`/`revalidateTag`, `useActionState`
43. Rendering strategies — static, dynamic, streaming, ISR, the Node vs Edge runtime tradeoff
44. Phase 7 revision notes — Server vs Client Components, routing, server data loading, Server Actions, rendering

**Phase 8 · Performance, A11y & DX**

45. Rendering & bundle performance — LCP/CLS/INP, code-splitting, hydration cost, measuring before optimizing
46. Accessibility that survives code review — semantic HTML, keyboard operability, the first rule of ARIA (don't)
47. Accessible, usable forms — label association, `fieldset`/`legend`, `aria-describedby`, announcing failures
48. Testing front-end like an engineer — the testing trophy, testing behavior not implementation, mocking the network
49. Developer experience — ESLint vs Prettier, strict TypeScript, pre-commit hooks and CI gates
50. Phase 8 revision notes — bundle performance, accessibility, accessible forms, testing, developer experience

**Phase 9 · Interview Closers**

51. Front-end system design — how to drive the whiteboard: scope, component architecture, data flow, tradeoffs
52. Debugging stories — symptom → investigation → root cause → fix → prevention, told as STAR
53. Rapid-fire fundamentals — the 60-second answers to the questions fired in the first ten minutes
54. Front-end coding challenges — debounce/throttle, a custom hook, tabs/autocomplete, `Promise.all` from scratch
55. Behavioral answers & closing strong — tradeoffs, technical disagreement, the questions that signal seniority
56. Phase 9 revision notes — and the course finale

## Running it

Requires Node 20.9+ (this repo pins `22.16.0` via `.nvmrc`).

```bash
nvm use          # picks up .nvmrc
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Progress, completed checkpoints, and quiz state all live in browser localStorage — clearing site data resets everything. There is a one-time migration on first load that moves the old `ai-course-progress-v1` key to `skillforge-progress-v1`, so existing learners don't lose XP or streaks.

## Quality gates

Two automated checks run on every PR — lint and visual regression. The same checks run locally before every `git push` via a Husky hook, so you catch failures on your machine instead of waiting on CI.

### `npm run verify` — the local gate

Chains all three checks in CI order:

```bash
npm run verify
# = npm run lint && npm run build && npm run test:visual
```

Budget: ~2–3 minutes on a warm M-class laptop (~5s lint + ~30–45s build + ~60–90s visual). The visual step dominates because Playwright runs sequentially (`workers: 1`) for deterministic snapshots.

A Husky `pre-push` hook runs `npm run verify` automatically on `git push`. The hook sources `nvm` and runs `nvm use` from `.nvmrc` so Node 22 is active even if your shell defaulted to a different version — if you don't use nvm, install Node 22 globally instead. To bypass the hook in an emergency:

```bash
git push --no-verify
```

Use sparingly — if the gate would have failed, CI will catch it and the round trip will cost more than waiting locally would have. The hook is wired in `.husky/pre-push` and installed via the `prepare` script on `npm install`.

If you intentionally changed a visual baseline, run `npm run test:visual:update` and commit the new PNGs *before* pushing — otherwise the hook will fail on a diff you already understand.

### Lint (`npm run lint`)

ESLint runs three rule sets:

- **`next/core-web-vitals`** — Next.js best practices, React-hooks rules, JSX accessibility rules from `eslint-plugin-jsx-a11y`
- **`next/typescript`** — TypeScript correctness on top of `@typescript-eslint`
- **`eslint-plugin-tailwindcss`** in strict mode — class-order normalization, contradicting-classname detection (e.g. `px-2 px-4`), shorthand enforcement (e.g. `mx-2 my-2` → `m-2`)

If lint fails, run `npx eslint . --fix` to auto-fix everything mechanical (class order, shorthands). The remaining errors are real and need human judgment.

### Visual regression (`npm run test:visual`)

Playwright renders 10 curated surfaces (nine routes plus the command palette) at 3 viewports each — 30 screenshots per run — and diffs against committed baselines in `tests/visual.spec.ts-snapshots/`.

Why: bugs like Tokey mascot overlap, sticky header overflow, and table clipping at 360px shipped because nobody had a fast way to check "does this still look right on phones." The diff is the check.

```bash
npm run build            # required — tests run against `next start`
npm run test:visual      # diff against baselines
npm run test:visual:update  # accept current rendering as new baseline
```

When a diff is intentional (you redesigned a page, you changed a token chip color), run `test:visual:update` and commit the new PNGs alongside your code change. CI also produces diff PNGs on failure — find them in the `playwright-diff-<run-id>` artifact on the GitHub Actions run.

Configuration lives in `playwright.config.ts` (viewports, determinism knobs) and `tests/visual.spec.ts` (route list). Adding a new route to the sweep is one line in `ROUTES`.

## Project structure

```
app/
  page.tsx                                       # course picker (landing)
  layout.tsx                                     # platform shell
  courses/
    ai/                                          # AI Engineering Foundations (33 modules)
      page.tsx                                   # course module grid
      modules/<slug>/page.tsx                    # one page per module
    dsa/                                         # Data Structures & Algorithms (43 modules)
    system-design/                               # System Design (50 modules)
    frontend/                                    # Frontend Engineering (57 modules)
components/
  Quiz.tsx, Checkpoint.tsx,                      # interactive pedagogy primitives
  WorkedExample.tsx, CodeExercise.tsx,
  ClassifyChallenge.tsx, Callout.tsx,
  PartRecap.tsx, TestYourself.tsx,
  GradientBowl.tsx, Tokey.tsx,
  ModuleProgress.tsx, HeaderStats.tsx,
  CodeBlock.tsx, Confetti.tsx, ...
lib/
  courses/
    ai.ts                                        # AI course: MODULES, PHASES, COURSE_META
    dsa.ts                                       # DSA course
    system-design.ts                             # System Design course
    frontend.ts                                  # Frontend course
    index.ts                                     # COURSES registry, CourseMeta type
    helpers.ts                                   # shared course-data helpers
  modules.ts                                     # backwards-compat shim → courses/ai
  progress.tsx                                   # localStorage-backed progress context
```

Adding a new course:

1. Create `lib/courses/<id>.ts` — export `MODULES`, `PHASES`, `COURSE_META`, `getModuleBySlug`.
2. Add it to `COURSES` in `lib/courses/index.ts`.
3. Create `app/courses/<id>/page.tsx` (course landing) and `app/courses/<id>/modules/<slug>/page.tsx` for each module.
4. Flip `COURSE_META.status` to `"available"` once you have content.

## Tech stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind CSS v4 (dark mode by default)
- React Context for progress / mascot / sound state
- No backend for the platform itself — everything runs client-side, with progress in localStorage. The Spring Boot service learners build in later AI modules is a *project*, not something this site hosts.

## Conventions

- `AGENTS.md` / `CLAUDE.md` — rules for AI coding agents working in this repo. Worth reading before letting an LLM edit code here (Next.js 16 has breaking changes from older training data).
- Commits should be small and focused per module — it makes it easier to diff what changed pedagogically.
