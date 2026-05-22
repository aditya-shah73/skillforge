// ESLint flat config for Next 16.
// Next 15+ dropped the built-in `next lint` command. `eslint-config-next` v16
// now ships native flat configs at its `/core-web-vitals` and `/typescript`
// subpath exports — we import those directly rather than going through the
// legacy `FlatCompat` shim (which hits a circular-structure bug with the
// modern plugin graph). The two presets together cover hooks dependency
// arrays, Next/Image misuse, broken anchors, and the TypeScript rules
// `create-next-app` ships with — high-signal-only.
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";

// Compute repo-absolute paths so the Tailwind plugin's worker (which runs
// from its own cwd, not ours) can find globals.css and the tailwindcss
// package. Relative paths bite when ESLint is invoked from a subdirectory
// or by an editor.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  // Tailwind classname linting. The plugin's flat/recommended ships every
  // rule at `warn`; we elevate the highest-signal ones to `error` so they
  // block CI. Rationale per rule:
  //   - classnames-order: keeps diffs reviewable (no semantic change, but
  //     drift makes git blame noisy and conflicts more frequent).
  //   - no-contradicting-classname: catches real bugs like `px-2 px-4`,
  //     `bg-red-500 bg-blue-500`, or `hidden block`. Always a mistake.
  //   - enforces-negative-arbitrary-values: catches `-m-[10px]` vs
  //     `m-[-10px]`. The former is the Tailwind-idiomatic form.
  //   - enforces-shorthand: catches `mx-2 my-2` (should be `m-2`),
  //     `pt-3 pb-3` (should be `py-3`). Cosmetic but cheap to enforce.
  //   - no-unnecessary-arbitrary-value: catches `text-[16px]` where
  //     `text-base` exists. Keeps us using design tokens.
  // `no-custom-classname` stays at warn — Tailwind v4's `@theme` directive
  // creates utility names the plugin doesn't see, so this rule produces
  // false positives on our `slate-*` remaps (defined in app/globals.css).
  ...tailwind.configs["flat/recommended"],
  {
    settings: {
      tailwindcss: {
        // Tailwind v4 reads config from the CSS `@theme` directive, not a JS
        // config file. Point the plugin at the canonical entry so it picks
        // up our `slate-*` → zinc remap and any future custom utilities.
        // Use absolute path — the plugin's worker resolves the parent dir
        // relative to the config string, and a relative path resolves against
        // the worker cwd (not ours).
        config: path.join(__dirname, "app/globals.css"),
        // Class attribute names we use in addition to the default `class` /
        // `className`. None today, but listing the prop keeps it as an opt-in
        // extension point.
        classRegex: "^class(Name)?$",
      },
    },
    rules: {
      "tailwindcss/classnames-order": "error",
      "tailwindcss/no-contradicting-classname": "error",
      "tailwindcss/enforces-negative-arbitrary-values": "error",
      "tailwindcss/enforces-shorthand": "error",
      "tailwindcss/no-unnecessary-arbitrary-value": "error",
      // Keep at warn — v4 @theme custom names aren't recognized by the
      // plugin and would otherwise trigger across hundreds of files.
      "tailwindcss/no-custom-classname": "warn",
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Playwright snapshots are PNG binaries; the snapshot directory has no
      // .ts/.tsx files but ignoring it explicitly future-proofs against
      // accidental fixture additions there.
      "tests/visual.spec.ts-snapshots/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  {
    rules: {
      // We have a few intentional `any` casts (e.g. AudioContext typing on
      // older Safari). Warn rather than error.
      "@typescript-eslint/no-explicit-any": "warn",
      // The codebase intentionally uses literal apostrophes inside JSX prose
      // for readability ("you're", "don't"). Disable the auto-escape rule.
      "react/no-unescaped-entities": "off",
      // react-hooks v7 introduced two strict rules that fire on patterns we
      // use intentionally across the app:
      //   - `set-state-in-effect`: every client component uses a
      //     `useEffect(() => setMounted(true), [])` hydration guard so the
      //     SSR output matches the first client render (we don't want a
      //     flash of zero progress for users with localStorage data). The
      //     "correct" replacement is `useSyncExternalStore`, which is a
      //     site-wide refactor and a separate piece of work.
      //   - `purity`: `useRef(Date.now())` and `Math.random()` calls inside
      //     event handlers are flagged. Each instance is intentional
      //     (per-quiz start timestamps, randomized encouragement strings)
      //     and downgrading to warn keeps the lint output actionable
      //     without blocking CI.
      // Downgrade both to warnings — the issues are surfaced for the team
      // to address, but `npm run lint` still passes on the existing code.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      // Unused imports across module pages are leftovers from the heavy
      // copy-paste flow when authoring courses. Worth cleaning up but
      // shouldn't gate builds.
      "@typescript-eslint/no-unused-vars": "warn",

      // ===== jsx-a11y: tighten the rules that map to bugs we shipped =====
      // next/core-web-vitals ships ~6 a11y rules at `warn`. We elevate the
      // ones that catch actual bugs we'd want to block on, and add a few
      // not in the default set. Picked by mapping prior audit findings:
      //
      //   - alt-text: caught broken hero images in image-heavy modules
      //   - aria-props: typo'd ARIA attrs silently no-op; this catches them
      //   - aria-proptypes: e.g. `aria-expanded="yes"` (must be "true"/"false")
      //   - role-has-required-aria-props: e.g. `role="checkbox"` needs
      //     `aria-checked` (the disclosure aria fix in Phase 3 hit this)
      //   - role-supports-aria-props: catches placing `aria-selected` on a
      //     `<div>` that has no role, where it's ignored by AT
      //   - aria-unsupported-elements: `aria-label` on a `<meta>` etc
      //
      // The rules NOT elevated to error (kept at warn or omitted):
      //   - no-autofocus: we use autofocus in CommandPalette intentionally
      //   - no-onchange: not relevant to React (uses onChange semantics)
      //   - heading-has-content: triggers on `<h2><Icon /></h2>` patterns
      //     where the icon is decorative — we'd need to thread `aria-label`
      //     manually across dozens of headings; tackle separately
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      // Additional high-signal rules not in next's defaults:
      //   - anchor-is-valid: catches `<a>` without href (use <button> instead).
      //     Mapped to the "broken keyboard nav" findings in the a11y audit.
      //   - click-events-have-key-events: catches `<div onClick>` without
      //     a key handler — would have caught the CommandPalette opener bug.
      //   - no-noninteractive-element-interactions: `<li onClick>` etc
      //   - tabindex-no-positive: `tabIndex={5}` breaks tab order globally
      //   - no-redundant-roles: `<button role="button">` is a code smell
      //   - aria-role: catches `role="navigation-bar"` typos
      //   - no-aria-hidden-on-focusable: `aria-hidden` on a focusable element
      //     traps screen readers — bug we shipped once.
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/click-events-have-key-events": "warn", // many existing offenders; warn first
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/tabindex-no-positive": "error",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/no-aria-hidden-on-focusable": "error",
    },
  },
];

export default eslintConfig;
