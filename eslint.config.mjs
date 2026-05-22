// ESLint flat config for Next 16.
// Next 15+ dropped the built-in `next lint` command. `eslint-config-next` v16
// now ships native flat configs at its `/core-web-vitals` and `/typescript`
// subpath exports — we import those directly rather than going through the
// legacy `FlatCompat` shim (which hits a circular-structure bug with the
// modern plugin graph). The two presets together cover hooks dependency
// arrays, Next/Image misuse, broken anchors, and the TypeScript rules
// `create-next-app` ships with — high-signal-only.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
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
    },
  },
];

export default eslintConfig;
