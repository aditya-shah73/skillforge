# Skillforge

Hands-on, project-driven courses for working engineers. The whole thing is a Next.js app you run locally — every module is a single page with embedded quizzes, worked examples, code exercises, and gating checkpoints. Progress is tracked in localStorage. There's a mascot called Tokey.

## Tracks

- **AI Engineering Foundations** — *available now.* From zero ML background to shipping production AI features (Java / Spring / React / GraphQL). 28 modules across 6 phases (plus orientation).
- **Data Structures and Algorithms** — *available now (orientation only — content rolling out).* Pattern-first LeetCode prep for engineers returning to interview prep after years away. 34 modules across 8 phases (plus orientation), shipping one module at a time.

The home page is a course picker; pick a track and dive in.

## Pedagogy

The platform is opinionated. Every concept follows the same five-step contract:

1. **Analogy** — the intuition, before any math
2. **Formula (or pattern)** — with every symbol explained
3. **Worked example** — by hand, with actual numbers (or a fully traced LeetCode problem)
4. **Variants** — what changes in practice, and why
5. **Checkpoint** — a quiz that gates progress

A checkpoint only clears when you can do three things: explain the idea in two minutes, recognize it in code you didn't write, and implement it from scratch in Java. Quizzes enforce this — you don't progress by clicking "next," you progress by answering correctly.

## AI Engineering Foundations — curriculum

28 modules across 6 phases (plus orientation). All available today.

**Phase 0 · Orientation**

0. Welcome — what this course is (and isn't), how to get the most out of it

**Phase 1 · ML & AI Foundations**

1. Tokenization — why the AI charges you by the tokwhat?
2. Supervised learning foundations — problem types, features, labels, loss
3. How models actually learn — gradient descent, LR tuning, overfitting, eval metrics
4. Neural networks — layers, activations, backprop from intuition up
5. Transformers & attention — the architecture that ate the ML world
6. Embeddings: numbers become geometry — vector space, cosine similarity, why semantic search works
7. Prompt engineering — system prompts, few-shot, CoT, structured output
8. Putting it all together — trace a real LLM request through every concept from Modules 1–7

**Phase 2 · API & Backend Integration**

9. Claude API fundamentals — auth, models, parameters
10. Spring AI integration — the Spring-native way to call LLMs
11. Tool use & function calling — let the LLM call your GraphQL resolvers
12. Streaming with SSE — token-by-token from Spring Boot to React
13. Prompt caching & cost — running LLMs at production scale

**Phase 3 · Vector Search & RAG**

14. Embeddings deep dive — production embedding models, dimensions, cost, the curse
15. Vector DBs & pgvector — HNSW vs IVFFlat, indexing, Postgres integration
16. RAG architecture — chunking, retrieval, context assembly
17. RAG in Spring Boot end-to-end — Spring AI + pgvector, full pipeline

**Phase 4 · Frontend AI Integration**

18. React streaming patterns — SSE consumption, optimistic updates, tool results
19. Full chat interface — React + GraphQL + Spring Boot end-to-end
20. Multimodal inputs — images, files, vision models

**Phase 5 · Agents & Advanced Patterns**

21. Agent fundamentals — ReAct loop, memory, when NOT to use agents
22. Agents in Spring Boot — tool loop, state, stopping conditions
23. Multi-agent patterns — orchestrator/subagent, parallelization

**Phase 6 · Production & Capstone**

24. Evals — LLM-as-judge, golden sets, regression testing
25. Security & guardrails — prompt injection, PII, output filtering
26. Fine-tuning & RLHF — when to bother, and why RAG usually wins
27. Capstone project — end-to-end AI engineering assistant

### Projects

Theory-only courses don't stick. Each module ships with a hands-on project — most are Java/Spring builds you do alongside the reading. A few highlights:

- **Phase 1** — interactive tokenizer playground, linear regression from scratch in Java (parts 1 & 2), tiny MLP digit classifier, scaled dot-product attention from scratch, nearest-neighbor search with a 2D visualizer, prompt pattern playground
- **Phase 2** — AI code reviewer CLI, journal assistant, GraphQL-aware tool-use assistant, live story generator, cost dashboard
- **Phase 3** — semantic bookmark search, duplicate issue detector, doc chunking lab, "chat with your docs"
- **Phase 4–5** — chat UI component library, team standup bot, receipt parser, research/migration/PR-review agents
- **Phase 6** — eval harness, prompt-injection test suite, decision framework (fine-tune vs prompt vs RAG), and the capstone: a portfolio-ready AI engineering assistant

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

Playwright renders 9 curated routes at 3 viewports each — 27 screenshots per run — and diffs against committed baselines in `tests/visual.spec.ts-snapshots/`.

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
    ai/
      page.tsx                                   # AI course module grid
      modules/<slug>/page.tsx                    # one page per AI module (28)
    dsa/                                         # (placeholder — content coming)
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
    dsa.ts                                       # DSA course: stub
    index.ts                                     # COURSES registry, CourseMeta type
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
