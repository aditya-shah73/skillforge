---
name: frontend-modules
description: How Skillforge frontend teaching modules are authored — file layout, registry, and exact component contracts for Callout/Quiz/Checkpoint
metadata:
  type: project
---

Skillforge frontend course = Next.js App Router pages under `app/courses/frontend/modules/<slug>/page.tsx`. Each module is registered in `lib/courses/frontend.ts`; pull metadata at runtime via `getModuleBySlug(MODULE_SLUG)!` (gives `.number`, `.duration`, etc).

**Why:** Modules follow one rigid skeleton so progress/nav components wire up consistently. Deviating breaks gating.

**How to apply when writing a module page:**
- Skeleton: `<article className="prose-custom">` → breadcrumb nav → `<header>` (phase/number badge gradient, h1 title, italic hook, `<BookmarkButton>`, `<ModuleProgress>`) → `<section>` blocks → `<ModuleNav>`.
- `CHECKPOINTS` const (array of `{id, title}`) passed to `<ModuleProgress>`; each `<Checkpoint id=... moduleSlug={MODULE_SLUG} title=...>` id+title MUST match a CHECKPOINTS entry.
- Component contracts (do not deviate): `<Callout variant>` is EXACTLY one of `"info" | "warn" | "insight" | "spring"` (spring = "Spring Boot Corner", odd for FE — avoid). `<Quiz kind question options={[{label, explanation?, correct?}]} />` — exactly one `correct: true`, give every option an explanation. `<Checkpoint>` wraps `<Quiz>`es and auto-fires when all answered; with no quizzes it falls back to a manual "Mark as done" button.
- JSX lint: codebase enforces `react/no-unescaped-entities`. In plain JSX text escape apostrophes as `&apos;`, quotes as `&quot;`. Multi-line/quote-containing JSX attrs use expression form `prop={"...\n..."}`. Inside Quiz string props (question/label/explanation) raw apostrophes are fine (JS strings); avoid unescaped double-quotes there. Use `<code>` JSX in prose, not backticks.
- Sibling reference for hooks-style modules: `app/courses/frontend/modules/state-rules/page.tsx` (same snapshot/queue subject matter, clean exemplar).
- Verify a single file: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "<slug>"`. Parent runs full build/visual; don't.
