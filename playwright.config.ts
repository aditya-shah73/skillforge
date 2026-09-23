import { defineConfig, devices } from "@playwright/test";

/**
 * Visual-regression configuration for Skillforge.
 *
 * Why three viewports:
 *   - 360 — the narrow Android baseline. Most of the mobile bugs we shipped
 *     (Tokey overlap, sticky header overflow, table clipping) only manifest
 *     here.
 *   - 768 — iPad portrait. Catches the awkward middle where `sm:` kicks in
 *     but `md:`/`lg:` haven't.
 *   - 1280 — laptop desktop. The viewport we'd naturally test in dev and is
 *     where the gradients and prose are tuned.
 *
 * Chromium-only on purpose:
 *   - Visual diffs only catch *visible* drift; we don't gain much by also
 *     running WebKit/Firefox. Cross-browser bugs are a separate concern.
 *   - One browser keeps the CI matrix tiny and snapshots deterministic.
 *
 * Determinism:
 *   - `reducedMotion: "reduce"` so the Tokey bounce + confetti freeze.
 *   - `colorScheme: "light"` so we don't diff against dark mode.
 *   - The dev server spin-up is owned by `webServer` so `npm test` is
 *     one-shot (no manual `npm run dev &` needed).
 *
 * Snapshot mode:
 *   - We use `toHaveScreenshot()` with a small `maxDiffPixelRatio` so font
 *     antialiasing wobble doesn't fail the run. Anything bigger than a few
 *     pixels' worth of drift is a real change worth reviewing.
 */
// Deliberately not 3000: that's where `npm run dev` lives, and the suite must
// never end up measuring it. See the `webServer` note at the bottom.
const VISUAL_PORT = Number(process.env.VISUAL_PORT ?? 3100);

export default defineConfig({
  testDir: "./tests",
  // Mac M1/M2 and Linux CI render fonts slightly differently — disabling
  // `expect.toMatchSnapshot.threshold` would force pixel-perfect, which fails
  // immediately on CI. The ratio below tolerates ~0.5% pixel drift.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  // Don't allow `.only` to land in CI.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // One worker keeps screenshot rendering deterministic; the bottleneck is
  // page nav, not parallelism, and parallel workers can race on the same
  // browser context cache.
  workers: 1,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: `http://localhost:${VISUAL_PORT}`,
    trace: "retain-on-failure",
    colorScheme: "light",
    reducedMotion: "reduce",
  },

  projects: [
    {
      name: "mobile-360",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 360, height: 800 },
      },
    },
    {
      name: "tablet-768",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "desktop-1280",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],

  // Boot the production server so we test what ships, not the dev overlay.
  //
  // This used to run on 3000 with `reuseExistingServer: !process.env.CI`,
  // which quietly broke the promise in the line above: if you had `npm run
  // dev` open — and you usually do — Playwright skipped `next start` and
  // pointed the whole suite at the dev server instead. That matters more than
  // it sounds. `next dev` builds into `.next/dev/` with its own next/font
  // output, and it emits a *different* Geist Mono subset than `next build`
  // does (29,972 bytes vs 23,108, different glyph advances: 8.40px/char
  // vs the correct 8.64px = 0.6em). Mono text therefore wraps at different
  // points in dev, so any baseline recorded that way bakes in wrap points
  // production will never reproduce, and the snapshot fails forever after.
  //
  // Own a dedicated port and never reuse, so `npm run verify` measures the
  // production build every time regardless of what else is running.
  webServer: {
    // `next start` requires a prior `next build`. The README documents the
    // two-step flow; CI runs both in sequence.
    command: `npm run start -- --port ${VISUAL_PORT}`,
    url: `http://localhost:${VISUAL_PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
