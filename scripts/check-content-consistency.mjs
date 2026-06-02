// Build-time content-consistency linter.
//
// Cross-checks the source-of-truth course data (lib/courses/<course>.ts —
// the MODULES and PHASES arrays) against the hand-authored module pages
// (app/courses/<course>/modules/<slug>/page.tsx). It catches the specific
// classes of drift we have repeatedly fixed by hand:
//
//   1. Broken module links      — a hardcoded /courses/<c>/modules/<slug>
//                                  href that points at a slug which no longer
//                                  exists in that course.
//   2. Module-count claims       — prose like "all 43 modules" / "forty-nine
//                                  modules" that disagrees with MODULES.length.
//   3. Phase-count claims         — prose like "across 9 phases" that disagrees
//                                  with the number of distinct phases.
//   4. Structural integrity       — duplicate slugs, module `number` not matching
//                                  array order, a phaseNumber missing from PHASES,
//                                  and MODULES ⇄ on-disk page parity.
//
// This is deliberately a *static* linter: it parses the .ts sources with
// regex (no TS compile step, matching scripts/build-search-index.mjs) so it
// runs fast and has no build-graph dependency. Every check is tuned for a
// near-zero false-positive rate — when in doubt it stays silent. It reports
// findings and exits non-zero so it can gate CI / the pre-push hook.
//
// We deliberately do NOT verify "Phase N: <Name>" prose against PHASES[N].name:
// pages legitimately use "Phase N" to mean an interview-process step (e.g. the
// system-design interview-framework's RESHAD steps) or a forward-nav label, so
// that check is pure noise. Link + count + structural checks carry the signal.
//
// Escape hatch: a page that legitimately states a count the linter would
// misread (e.g. "the 6 phases of a system design interview") can opt out of
// the count checks for that file with an HTML comment anywhere in the page:
//     {/* content-lint-disable count */}
//
// Run with: npm run lint:content   (or: node scripts/check-content-consistency.mjs)

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const COURSES = ["ai", "dsa", "system-design", "frontend"];

// Number words 0–99 → integer, for matching spelled-out counts like
// "forty-nine modules". We only build the range we plausibly need.
const ONES = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19,
};
const TENS = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90,
};

/** Parse a spelled-out number 0–99 ("forty-nine", "twelve"). Returns null if not one. */
function wordToNumber(word) {
  const w = word.toLowerCase();
  if (w in ONES) return ONES[w];
  if (w in TENS) return TENS[w];
  const m = w.match(/^([a-z]+)[\s-]([a-z]+)$/);
  if (m && m[1] in TENS && m[2] in ONES && ONES[m[2]] < 10) {
    return TENS[m[1]] + ONES[m[2]];
  }
  return null;
}

/**
 * Extract the MODULES and PHASES arrays from a course's .ts source. The data
 * is hand-maintained in a regular one-object-per-line shape, so targeted
 * regex is reliable here (and avoids a TS compile in a plain .mjs script).
 */
function parseCourse(courseId) {
  const src = readFileSync(join(root, "lib/courses", `${courseId}.ts`), "utf8");

  // PHASES: { number: N, name: "...", ... }
  const phases = [];
  const phaseRe = /\{\s*number:\s*(\d+)\s*,\s*name:\s*"((?:[^"\\]|\\.)*)"/g;
  // Only scan the PHASES block to avoid catching MODULES `number:` fields.
  const phasesBlock = sliceArray(src, "PHASES");
  let pm;
  while ((pm = phaseRe.exec(phasesBlock))) {
    phases.push({ number: Number(pm[1]), name: pm[2] });
  }

  // MODULES: { slug: "...", number: N, ... phaseNumber: N, title: "..." ... }
  const modules = [];
  const modulesBlock = sliceArray(src, "MODULES");
  const modRe = /\{\s*slug:\s*"([^"]+)"\s*,\s*number:\s*(\d+)\s*,\s*phase:\s*"((?:[^"\\]|\\.)*)"\s*,\s*phaseNumber:\s*(\d+)/g;
  let mm;
  while ((mm = modRe.exec(modulesBlock))) {
    modules.push({
      slug: mm[1],
      number: Number(mm[2]),
      phase: mm[3],
      phaseNumber: Number(mm[4]),
    });
  }

  return { phases, modules };
}

/**
 * Return the source substring spanning `export const NAME = [ ... ]`. Used to
 * scope a regex to one array so PHASES parsing doesn't catch MODULES fields.
 */
function sliceArray(src, name) {
  const start = src.indexOf(`export const ${name}`);
  if (start === -1) return "";
  // Find the array's opening bracket *after the `=`* so a type annotation
  // like `export const MODULES: Module[] = [` doesn't trip us up on the `[]`.
  const eq = src.indexOf("=", start);
  if (eq === -1) return "";
  const open = src.indexOf("[", eq);
  if (open === -1) return "";
  // Walk to the matching close bracket.
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  return src.slice(open);
}

/** All on-disk module page slugs for a course (directories with a page.tsx). */
function pageSlugs(courseId) {
  const dir = join(root, "app/courses", courseId, "modules");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() && existsSync(join(p, "page.tsx"));
  });
}

const findings = [];
function report(course, file, message) {
  findings.push({ course, file, message });
}

// ---------------------------------------------------------------------------
// Load all course data up front so cross-course href checks can resolve.
// ---------------------------------------------------------------------------
const data = {};
const slugSets = {};
for (const c of COURSES) {
  data[c] = parseCourse(c);
  slugSets[c] = new Set(data[c].modules.map((m) => m.slug));
}

// ---------------------------------------------------------------------------
// Check 4 (run first — structural integrity of the source data itself).
// ---------------------------------------------------------------------------
for (const c of COURSES) {
  const { modules, phases } = data[c];
  const file = `lib/courses/${c}.ts`;
  const phaseNumbers = new Set(phases.map((p) => p.number));

  const seen = new Set();
  modules.forEach((m, i) => {
    if (seen.has(m.slug)) report(c, file, `duplicate slug "${m.slug}"`);
    seen.add(m.slug);
    if (m.number !== i) {
      report(c, file, `module "${m.slug}" has number ${m.number} but is at array index ${i}`);
    }
    if (!phaseNumbers.has(m.phaseNumber)) {
      report(c, file, `module "${m.slug}" has phaseNumber ${m.phaseNumber} which is not in PHASES`);
    }
  });

  // On-disk pages without a MODULES entry (and vice-versa) — a real drift class.
  const onDisk = new Set(pageSlugs(c));
  for (const slug of onDisk) {
    if (!slugSets[c].has(slug)) {
      report(c, file, `page exists at app/courses/${c}/modules/${slug} but no MODULES entry references it`);
    }
  }
  for (const m of modules) {
    if (!onDisk.has(m.slug)) {
      report(c, file, `MODULES entry "${m.slug}" has no page at app/courses/${c}/modules/${m.slug}/page.tsx`);
    }
  }
}

// ---------------------------------------------------------------------------
// Per-page prose + link checks (checks 1–3).
// ---------------------------------------------------------------------------
const HREF_RE = /\/courses\/([a-z-]+)\/modules\/([a-z0-9-]+)/g;
// "43 modules" / "forty-nine modules" / "all 43 modules"
const COUNT_RE = /\b(\d{1,3}|[a-z]+(?:[\s-][a-z]+)?)\s+modules\b/gi;
// "9 phases" / "nine phases"
const PHASE_COUNT_RE = /\b(\d{1,2}|[a-z]+)\s+phases\b/gi;

// A page that legitimately discusses *other* counts (e.g. the "6 phases of a
// system-design interview") opts out of the count checks for that file with an
// HTML comment anywhere in the page:  {/* content-lint-disable count */}
const COUNT_OPT_OUT = "content-lint-disable count";

for (const c of COURSES) {
  const { modules } = data[c];
  const expectedModuleCount = modules.length;
  const expectedPhaseCount = new Set(modules.map((m) => m.phaseNumber)).size;

  for (const slug of pageSlugs(c)) {
    const rel = `app/courses/${c}/modules/${slug}/page.tsx`;
    const src = readFileSync(join(root, rel), "utf8");
    const countDisabled = src.includes(COUNT_OPT_OUT);

    // --- Check 1: hardcoded module hrefs resolve to a real slug. ---
    let hm;
    HREF_RE.lastIndex = 0;
    while ((hm = HREF_RE.exec(src))) {
      const [, course, target] = hm;
      if (!slugSets[course]) {
        report(c, rel, `link to unknown course "${course}" (/courses/${course}/modules/${target})`);
      } else if (!slugSets[course].has(target)) {
        report(c, rel, `dead module link → /courses/${course}/modules/${target} (no such slug)`);
      }
    }

    // --- Checks 2 & 3: count claims (skippable per-file via the escape hatch). ---
    if (!countDisabled) {
      // --- Check 2: module-count claims about *this* course. ---
      // Only flag a number that looks like a deliberate total (>= 10) so we
      // don't false-positive on "the next 3 modules" style local counts.
      let cm;
      COUNT_RE.lastIndex = 0;
      while ((cm = COUNT_RE.exec(src))) {
        const raw = cm[1];
        const n = /^\d+$/.test(raw) ? Number(raw) : wordToNumber(raw);
        if (n === null) continue;
        if (n >= 10 && n !== expectedModuleCount && plausibleCourseTotal(n)) {
          report(c, rel, `claims "${cm[0].trim()}" but ${c} has ${expectedModuleCount} modules`);
        }
      }

      // --- Check 3: phase-count claims. ---
      let pcm;
      PHASE_COUNT_RE.lastIndex = 0;
      while ((pcm = PHASE_COUNT_RE.exec(src))) {
        const raw = pcm[1];
        const n = /^\d+$/.test(raw) ? Number(raw) : wordToNumber(raw);
        if (n === null) continue;
        // Phase totals are small; only flag values in the believable range.
        if (n >= 3 && n <= 15 && n !== expectedPhaseCount) {
          report(c, rel, `claims "${pcm[0].trim()}" but ${c} has ${expectedPhaseCount} phases`);
        }
      }
    }
  }
}

/**
 * Heuristic: is `n` plausibly a claim about a course's *total* module count
 * rather than some unrelated number that happens to precede "modules"?
 * Course totals live in the 30-60 range; we accept 10-99 to stay future-proof
 * but this guard keeps the check honest about intent.
 */
function plausibleCourseTotal(n) {
  return n >= 10 && n <= 99;
}

// ---------------------------------------------------------------------------
// Check 5: prose must not use the em dash (U+2014). House style is commas or
// periods instead. This is a *prose-only* rule: code samples, comments, and
// inline code legitimately contain em dashes (ASCII art, regex, code prose),
// so we strip those contexts before scanning. We do NOT touch the en dash
// (U+2013), which stays for numeric ranges ("15-20 min", "Modules 1-7").
//
// Detection is line-based and deliberately conservative. The only place an em
// dash should survive is inside a template-literal block (the children of
// <CodeBlock>{`...`}</CodeBlock> / <pre><code>{`...`}</code></pre>), a JS/JSX
// comment, or an inline <code>/backtick span. Anything left after stripping
// those is visible reading text and gets flagged.
//
// Escape hatch (rare, e.g. a decorative "— Fin —" sign-off): mark the file with
//     {/* content-lint-disable em-dash */}
const EM_DASH = "—";
const EMDASH_OPT_OUT = "content-lint-disable em-dash";

/**
 * Scan one source file for em dashes that survive in *prose*, using a single
 * character-level state machine. Returns an array of { line } findings.
 *
 * The machine classifies every character as either CODE context (where an em
 * dash is fine) or PROSE context (where it is flagged):
 *
 *   CODE context, skipped:
 *     - template literals     `...`        (CodeBlock / <pre><code> samples,
 *                                            and code embedded in {`...`}, where
 *                                            em dashes appear in code comments)
 *     - inline <code>...</code> spans       (code identifiers shown in prose)
 *     - line comments        //  ... to end of line
 *     - block / JSX comments  /* ... *\/   (the {/* ... *\/} form too)
 *
 *   PROSE context, checked:
 *     - JSX text between tags        (>visible reading text<)
 *     - quoted-string VALUES         ("caption", quiz question/label/explanation,
 *       lib data title/subtitle/project): the codebase puts user-facing copy in
 *       string literals, so an em dash there is still visible prose.
 *
 * Deliberate design choice: we do NOT track single-/double-quoted strings as a
 * separate context. In TSX, a char-level scanner cannot reliably tell a JS
 * string literal apart from an apostrophe in JSX prose ("doesn't", "LinkedList's")
 * or a quote inside JSX text, so quote-tracking desynchronizes and corrupts all
 * downstream state. We instead treat string contents the same as JSX text: an
 * em dash anywhere outside a template literal / <code> / comment is prose. This
 * is exactly what we want, since user-facing copy lives in those string values,
 * and code identifiers never contain em dashes.
 *
 * Because we don't track strings, we must avoid mis-reading `//` inside a URL
 * (https://) as a line comment. We only start a line comment on `//` that is
 * NOT preceded by a colon. An in-string "/*" at worst masks a region we'd never
 * flag anyway, so it is harmless.
 *
 * We do NOT special-case the en dash (U+2013); it is intentionally left alone.
 */
function findProseEmDashes(src) {
  const out = [];
  const n = src.length;
  let line = 1;
  // Mutually-exclusive CODE-context flags. Anything not in one of these is prose.
  let inLineComment = false;
  let inBlockComment = false;
  let inTemplate = false; // backtick template literal
  let inCodeTag = false; // inside an inline <code>...</code> span

  for (let i = 0; i < n; i++) {
    const ch = src[i];
    const next = src[i + 1];

    if (ch === "\n") {
      line++;
      inLineComment = false; // line comments end at the newline
      continue;
    }

    // --- Exit / skip conditions for active CODE contexts ---
    if (inLineComment) continue;
    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inTemplate) {
      if (ch === "\\") {
        i++; // skip escaped char (e.g. \` or \$)
      } else if (ch === "`") {
        inTemplate = false;
      }
      continue;
    }
    if (inCodeTag) {
      // Look for the closing </code>; everything until then is code.
      if (ch === "<" && src.slice(i, i + 7).toLowerCase() === "</code>") {
        inCodeTag = false;
        i += 6;
      }
      continue;
    }

    // --- Enter conditions for CODE contexts (we're in prose/JSX/string text) ---
    // Line comment: `//` not part of a URL scheme (e.g. https://). We approximate
    // "URL" as a `//` immediately preceded by a colon.
    if (ch === "/" && next === "/" && src[i - 1] !== ":") {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === "`") {
      inTemplate = true;
      continue;
    }
    if (ch === "<" && src.slice(i, i + 6).toLowerCase() === "<code>") {
      inCodeTag = true;
      i += 5;
      continue;
    }

    // --- Prose context (JSX text or a user-facing string value): flag em dash,
    // unless it's a standalone glyph rather than prose punctuation. A bare em
    // dash whose neighbors (ignoring spaces) are JSX tag boundaries, e.g.
    // <td>—</td>, is a "not applicable" / placeholder marker in a table, not a
    // dash joining clauses. We only skip the isolated-glyph case: prev non-space
    // is ">" (end of the opening tag) AND next non-space is "<" (start of the
    // closing tag).
    if (ch === EM_DASH) {
      let p = i - 1;
      while (p >= 0 && (src[p] === " " || src[p] === "\t")) p--;
      let q = i + 1;
      while (q < n && (src[q] === " " || src[q] === "\t")) q++;
      const isStandaloneGlyph = src[p] === ">" && src[q] === "<";
      if (!isStandaloneGlyph) out.push({ line });
    }
  }

  return out;
}

// Files to scan for prose em dashes: every course module page + landing page,
// the course data sources (titles/subtitles/projects/phase names are prose),
// shared UI components, and top-level app pages.
const proseFiles = [];
for (const c of COURSES) {
  const landing = `app/courses/${c}/page.tsx`;
  if (existsSync(join(root, landing))) proseFiles.push(landing);
  for (const slug of pageSlugs(c)) {
    proseFiles.push(`app/courses/${c}/modules/${slug}/page.tsx`);
  }
  proseFiles.push(`lib/courses/${c}.ts`);
}
// `ai` data lives at lib/modules.ts (re-exported), include it too.
if (existsSync(join(root, "lib/modules.ts"))) proseFiles.push("lib/modules.ts");
// Shared components (UI strings) and top-level app pages.
for (const rel of walkSource(join(root, "components"))) proseFiles.push(rel);
for (const rel of walkSource(join(root, "app"), "app/courses")) proseFiles.push(rel);

for (const rel of [...new Set(proseFiles)]) {
  const abs = join(root, rel);
  if (!existsSync(abs)) continue;
  const src = readFileSync(abs, "utf8");
  // Whole-file opt-out: a marker anywhere in the file exempts the entire file.
  if (src.includes(EMDASH_OPT_OUT)) continue;
  const srcLines = src.split("\n");
  for (const { line } of findProseEmDashes(src)) {
    // Per-line opt-out: the em dash on this line is an intentional non-prose use
    // (a table "not applicable" glyph, graph edge notation, etc.). Honor a marker
    // on the same line or the line immediately above it, so the rest of the file
    // still catches genuinely new prose em dashes.
    const here = srcLines[line - 1] || "";
    const above = srcLines[line - 2] || "";
    if (here.includes(EMDASH_OPT_OUT) || above.includes(EMDASH_OPT_OUT)) continue;
    report("style", rel, `prose em dash (—) at line ${line}; use a comma or period instead`);
  }
}

/**
 * Recursively collect .ts/.tsx source files under `dir`, skipping any path that
 * starts with `excludePrefix` (relative to root) and node_modules/.next.
 */
function walkSource(dir, excludePrefix) {
  const acc = [];
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const abs = join(dir, name);
    const rel = abs.slice(root.length + 1);
    if (excludePrefix && rel.startsWith(excludePrefix)) continue;
    const st = statSync(abs);
    if (st.isDirectory()) {
      acc.push(...walkSource(abs, excludePrefix));
    } else if (/\.(ts|tsx)$/.test(name)) {
      acc.push(rel);
    }
  }
  return acc;
}

// ---------------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------------
if (findings.length === 0) {
  const totalModules = COURSES.reduce((sum, c) => sum + data[c].modules.length, 0);
  console.log(`✓ content-consistency: no drift found across ${COURSES.length} courses / ${totalModules} modules.`);
  process.exit(0);
}

console.error(`✗ content-consistency: ${findings.length} issue(s) found:\n`);
for (const f of findings) {
  console.error(`  [${f.course}] ${f.file}\n      ${f.message}`);
}
console.error("");
process.exit(1);
