<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Skillforge platform conventions

This repo is a multi-course learning platform. Each course is a self-contained track:

- `lib/courses/<id>.ts` — the course's data: `MODULES`, `PHASES`, `COURSE_META`, `getModuleBySlug`.
- `app/courses/<id>/page.tsx` — the course landing page (module grid).
- `app/courses/<id>/modules/<slug>/page.tsx` — one page per module.

The platform-level home page (`app/page.tsx`) is a course picker that reads from `lib/courses/index.ts`. Don't put course-specific copy there.

`lib/modules.ts` is a backwards-compat shim that re-exports from `lib/courses/ai`. New code should import from the per-course module directly (`@/lib/courses/ai` or `@/lib/courses/dsa`), not from `@/lib/modules`.

The active courses today:

- **`ai`** — *AI for Engineers*, available, 28 modules.
- **`dsa`** — *DSA in Java*, available, 34 modules total (only orientation shipping today; content rolling out one module at a time).

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

`lib/courses/<id>.ts` is the single source of truth for each course. Flipping a module's `status: "coming-soon"` → `"available"` is what makes it show up as playable on its course page. The course page and the platform picker both derive counts dynamically — don't hardcode "N modules" anywhere in app code.

(`lib/modules.ts` is a temporary back-compat shim re-exporting from `lib/courses/ai`. Existing module pages still import from it. New imports should target `lib/courses/<id>` directly.)

# Quality gates (CI)

Two checks run on every PR. If you touch UI code, expect to interact with both.

## Lint — `npm run lint`

Tailwind class order is enforced as an error. After any edit that adds or reorders Tailwind classes, run `npx eslint . --fix` before committing — it fixes class order, contradicting classnames, and shorthand opportunities mechanically. The remaining lint errors (jsx-a11y violations, react-hooks issues) are real and need a human-judgment fix.

When elevating a new lint rule to `error`, run `--fix` first to see if the violations are mechanical. Don't ship a rule that produces hundreds of un-auto-fixable errors without a plan to clean them up.

## Visual regression — `npm run test:visual`

Playwright snapshots 9 routes × 3 viewports (mobile-360, tablet-768, desktop-1280). Baselines live in `tests/visual.spec.ts-snapshots/` and ARE committed.

When you change UI:

1. `npm run build` — required, tests run against `next start`
2. `npm run test:visual` — see what diffs
3. If the diff is intentional: `npm run test:visual:update` and commit the new PNGs **in the same PR** as the code change
4. If the diff is regressive: fix the bug; re-run; don't update baselines

Routes are defined in `tests/visual.spec.ts` (`ROUTES` array). To add a route to the sweep, append one line — it's cheap (~3 snapshots per route).

If you're adding a new component that animates or has timing-sensitive behavior, audit `tests/visual.spec.ts` to make sure your route either (a) waits the animation out before screenshotting or (b) masks the moving element. Don't add `waitForTimeout` longer than 1 second — `reducedMotion: "reduce"` in `playwright.config.ts` already collapses animation duration.
