import { test, expect } from "@playwright/test";

/**
 * Visual regression sweep — curated routes covering the patterns that
 * historically broke without us noticing:
 *
 *   - Home page (hero, value props, gamification preview)
 *   - Three course landings (phase header wrap, PhaseProgress badge)
 *   - One module per course exercising tables, code blocks, callouts, quizzes
 *   - The achievements page (badge grid + stats strip + backup controls)
 *   - One interactive surface (CommandPalette opened via cmd-k)
 *
 * The ten routes below plus the interactive command-palette test run once per
 * viewport project (mobile-360, tablet-768, desktop-1280), so a single PR
 * review surface gets 33 screenshots (11 surfaces × 3 viewports).
 *
 * Adding more routes is cheap — append a line to ROUTES. Each new route
 * adds three screenshots (one per viewport) and a few seconds to the run.
 */

const ROUTES: { path: string; name: string }[] = [
  { path: "/", name: "home" },
  { path: "/courses/ai", name: "course-ai-landing" },
  { path: "/courses/dsa", name: "course-dsa-landing" },
  { path: "/courses/system-design", name: "course-system-design-landing" },
  // Module pages: pick ones that exercise the patterns most prone to drift —
  // tokenization has tables + interactive demo, cap-pacelc has the 2x2 grid
  // we just made responsive, big-o has the Big-O comparison tables.
  { path: "/courses/ai/modules/tokenization", name: "module-ai-tokenization" },
  { path: "/courses/ai/modules/security", name: "module-ai-security" },
  { path: "/courses/dsa/modules/big-o", name: "module-dsa-big-o" },
  { path: "/courses/system-design/modules/cap-pacelc", name: "module-sd-cap-pacelc" },
  // The frontend course shipped after the original sweep — values-references is
  // a content-rich Phase 1 module (code blocks, callouts, quizzes, checkpoint)
  // so it exercises the same drift-prone patterns the other module pages do.
  { path: "/courses/frontend/modules/values-references", name: "module-frontend-values-references" },
  // Achievements page: badge grid, headline stats strip, and the backup/
  // restore card. Exercises the gradient badge tiles + the responsive 2/3/4-col
  // grids. Rendered with empty progress (no localStorage in a fresh context),
  // so the baseline is the all-locked / zero-stats state.
  { path: "/achievements", name: "achievements" },
];

for (const route of ROUTES) {
  test(`route: ${route.name}`, async ({ page }) => {
    await page.goto(route.path);
    // Wait for hydration — the layout has client components (HeaderStats,
    // Tokey) that animate in on mount. Without this, the first run captures
    // the SSR skeleton and every subsequent run flags a diff.
    await page.waitForLoadState("networkidle");
    // Tokey delays its welcome bubble by 1500ms — wait it out so the
    // screenshot is either pre-bubble or post-bubble consistently. We pick
    // pre-bubble (screenshot before t=1500ms is hard to time reliably);
    // instead we let it appear and then dismiss by waiting long enough for
    // its 6000ms auto-hide. The reducedMotion: reduce in playwright.config
    // collapses animation duration so this is fast in practice.
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot(`${route.name}.png`, {
      fullPage: true,
      // Mask out elements whose contents change between runs but whose
      // layout we still want to verify:
      //   - HeaderStats XP counter (we showed "1,240" in the demo; real users
      //     get whatever they have). We mask it so we still catch sizing
      //     issues but ignore the number.
      mask: [page.locator('[aria-label="Hide Tokey mascot"]'), page.locator('[aria-label="Show Tokey mascot"]')],
    });
  });
}

test("interactive: command palette open", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Trigger ⌘K / Ctrl+K. Playwright normalizes Meta to the OS-native modifier.
  await page.keyboard.press("Meta+k");
  // The palette has an entrance animation; wait for it to be in the DOM.
  await page.getByRole("dialog").or(page.getByPlaceholder(/search/i)).first().waitFor({ state: "visible" });
  await page.waitForTimeout(200);

  await expect(page).toHaveScreenshot("interactive-command-palette.png", {
    fullPage: false,
  });
});
