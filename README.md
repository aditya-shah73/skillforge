# AI Course for Full-Stack Engineers

An interactive, browser-based course that takes a working full-stack engineer (Java / Spring / React / GraphQL) from zero ML background to shipping production AI features — with agents, RAG, evals, and the rest of the modern stack.

The whole thing is a Next.js app you run locally. Every module is a single page with embedded quizzes, worked examples, code exercises, and checkpoints. Progress is tracked in localStorage. There's a mascot called Tokey.

## What's in here

### Pedagogy

The course is opinionated. Every concept follows the same contract:

- **Analogy first** — the intuition before the math
- **Then the formula** — with every symbol explained
- **Then a worked example** — by hand, with actual numbers
- **Then the variants** — what changes in practice, and why

A checkpoint clears only when you can do three things: explain the idea in two minutes, recognize it in code, and implement it from scratch in Java. Quizzes enforce this — you don't progress by clicking "next," you progress by answering correctly.

### Curriculum — 25 modules across 6 phases

**Phase 1 · ML & AI Foundations**

1. Tokenization — why the AI charges you by the tokwhat?
2. Supervised learning foundations — problem types, features, labels, loss
3. How models actually learn — gradient descent, LR tuning, overfitting, eval metrics
4. Neural networks — layers, activations, backprop from intuition up
5. Transformers & attention — the architecture that ate the ML world
6. Embeddings: numbers become geometry — tokens, fine-tuning, RLHF
7. Prompt engineering — system prompts, few-shot, CoT, structured output

**Phase 2 · API & Backend Integration**

8. Claude API fundamentals — auth, models, parameters
9. Spring AI integration — the Spring-native way to call LLMs
10. Tool use & function calling — let the LLM call your GraphQL resolvers
11. Streaming with SSE — token-by-token from Spring Boot to React
12. Prompt caching & cost — running LLMs at production scale

**Phase 3 · Vector Search & RAG**

13. Embeddings deep dive — geometry, cosine similarity, models
14. Vector DBs & pgvector — HNSW vs IVFFlat, indexing, Postgres integration
15. RAG architecture — chunking, retrieval, context assembly
16. RAG in Spring Boot end-to-end — Spring AI + pgvector, full pipeline

**Phase 4 · Frontend AI Integration**

17. React streaming patterns — SSE consumption, optimistic updates, tool results
18. Full chat interface — React + GraphQL + Spring Boot end-to-end
19. Multimodal inputs — images, files, vision models

**Phase 5 · Agents & Advanced Patterns**

20. Agent fundamentals — ReAct loop, memory, when NOT to use agents
21. Agents in Spring Boot — tool loop, state, stopping conditions
22. Multi-agent patterns — orchestrator/subagent, parallelization

**Phase 6 · Production & Capstone**

23. Evals — LLM-as-judge, golden sets, regression testing
24. Security & guardrails — prompt injection, PII, output filtering
25. Capstone project — end-to-end AI engineering assistant

Status today: Modules 1, 2, and 3 are built out. The rest are listed but not yet available.

### Projects

Theory-only courses don't stick. Each module ships with a hands-on project:

- **Module 1** — interactive tokenizer playground (built into the page)
- **Module 2** — linear regression from scratch in Java (model + MSE loss)
- **Module 3** — same project, part 2 (gradient descent training loop + evaluation)
- Later modules wire into a single capstone: a production-shaped AI engineering assistant

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
  modules/
    tokenization/page.tsx          # Module 1
    ml-basics/page.tsx             # Module 2
    ml-training/page.tsx           # Module 3
components/
  Quiz.tsx, Checkpoint.tsx,        # interactive pedagogy primitives
  WorkedExample.tsx, CodeExercise.tsx,
  Callout.tsx, PartRecap.tsx,
  TestYourself.tsx, GradientBowl.tsx,
  Tokey.tsx, ModuleProgress.tsx, ...
lib/
  modules.ts                       # single source of truth for the syllabus
  progress.tsx                     # localStorage-backed progress context
```

Every new module is a single `app/modules/<slug>/page.tsx` that composes the primitives in `components/`. The syllabus in `lib/modules.ts` drives the home page grid, so flipping a module's `status` from `"coming-soon"` to `"available"` is what makes it show up as playable.

## Tech stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind CSS v4 (dark mode by default)
- React Context for progress / mascot / sound state
- No backend yet — everything runs client-side. Later modules will add a Spring Boot service.

## Conventions

- `AGENTS.md` / `CLAUDE.md` — rules for AI coding agents working in this repo. Worth reading before letting an LLM edit code here (Next.js 16 has breaking changes from older training data).
- Commits should be small and focused per module — it makes it easier to diff what changed pedagogically.
