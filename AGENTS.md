<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Course conventions

## Module durations

Use **ranges**, not single values, for any module longer than ~30 minutes. The low end is the engaged-reader path (does quizzes, skims worked examples). The high end assumes the learner actually builds the project from scratch.

Examples:

- `"~5 min"` — short intro, no project
- `"15 min intro"` — single concept, playground only
- `"~1.5–2.5h"` — one checkpoint-heavy module with a small Java project
- `"~2.5–3h"` — a dense module with a multi-file project

Don't write `"~3h"` as a single value — it's aspirational and sets bad expectations.

## Module structure contract

Every module follows the same rhythm:

1. **Analogy** — the intuition, before any math
2. **Formula** — with every symbol explained
3. **Worked example** — by hand, with real numbers
4. **Variants** — what changes in practice, and why
5. **Checkpoint** — a quiz that gates progress

A checkpoint should test three bars:

- Explain the concept in 2 minutes without jargon
- Recognize it in code the learner didn't write
- Implement it from scratch in Java

## Pedagogy primitives

Reuse components from `components/` rather than inventing new patterns:

- `Quiz`, `Checkpoint`, `ModuleProgress` — for gating
- `WorkedExample`, `CodeExercise`, `ClassifyChallenge` — for practice
- `Callout` (variants: `info`, `warn`, `insight`, `spring`), `PartRecap`, `TestYourself` — for narrative structure
- `CodeBlock` — for Java or plain code samples

## The syllabus

`lib/modules.ts` is the single source of truth. Flipping `status: "coming-soon"` → `"available"` is what makes a module show up as playable on the home page. The home page derives counts dynamically — don't hardcode "N modules" anywhere.
