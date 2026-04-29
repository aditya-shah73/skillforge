# AI for Engineers

An interactive, browser-based course that takes a working full-stack engineer (Java / Spring / React / GraphQL) from zero ML background to shipping production AI features — with agents, RAG, evals, and the rest of the modern stack.

The whole thing is a Next.js app you run locally. Every module is a single page with embedded quizzes, worked examples, code exercises, and checkpoints. Progress is tracked in localStorage. There's a mascot called Tokey.

## What's in here

### Pedagogy

The course is opinionated. Every concept follows the same five-step contract:

1. **Analogy** — the intuition, before any math
2. **Formula** — with every symbol explained
3. **Worked example** — by hand, with actual numbers
4. **Variants** — what changes in practice, and why
5. **Checkpoint** — a quiz that gates progress

A checkpoint only clears when you can do three things: explain the idea in two minutes, recognize it in code you didn't write, and implement it from scratch in Java. Quizzes enforce this — you don't progress by clicking "next," you progress by answering correctly.

### Curriculum — 28 modules across 6 phases (plus orientation)

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

Status today: all 28 modules are built and available.

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

Progress, completed checkpoints, and quiz state all live in browser localStorage — clearing site data resets the course.

## Project structure

```
app/
  page.tsx                         # course home / module grid
  modules/<slug>/page.tsx          # one page per module (28 of them)
components/
  Quiz.tsx, Checkpoint.tsx,        # interactive pedagogy primitives
  WorkedExample.tsx, CodeExercise.tsx,
  ClassifyChallenge.tsx, Callout.tsx,
  PartRecap.tsx, TestYourself.tsx,
  GradientBowl.tsx, Tokey.tsx,
  ModuleProgress.tsx, HeaderStats.tsx,
  CodeBlock.tsx, Confetti.tsx, ...
lib/
  modules.ts                       # single source of truth for the syllabus
  progress.tsx                     # localStorage-backed progress context
```

Every module is a single `app/modules/<slug>/page.tsx` that composes the primitives in `components/`. The syllabus in `lib/modules.ts` drives the home page grid; flipping a module's `status` is what controls whether it shows up as playable.

## Tech stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind CSS v4 (dark mode by default)
- React Context for progress / mascot / sound state
- No backend for the course site itself — everything runs client-side, with progress in localStorage. The Spring Boot service you'll see in later modules is something you build *as a project*, not something this site hosts.

## Conventions

- `AGENTS.md` / `CLAUDE.md` — rules for AI coding agents working in this repo. Worth reading before letting an LLM edit code here (Next.js 16 has breaking changes from older training data).
- Commits should be small and focused per module — it makes it easier to diff what changed pedagogically.
