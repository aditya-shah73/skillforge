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
 * Course totals live in the 30–60 range; we accept 10–99 to stay future-proof
 * but this guard keeps the check honest about intent.
 */
function plausibleCourseTotal(n) {
  return n >= 10 && n <= 99;
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
