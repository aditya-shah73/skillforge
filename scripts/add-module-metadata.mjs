// One-time generator: enrich every module object across the four course files
// with mechanically-derived `difficulty`, `tags`, and `estimatedMinutes`.
//
// Idempotent: skips any module line that already has an `estimatedMinutes:`
// field, so re-running won't double-insert. Inserts the three fields
// immediately before the trailing `status:` key, preserving the single-line
// shape the files use.
//
// Run with: node scripts/add-module-metadata.mjs
//
// This is a dev tool — it is NOT part of the build. Safe to delete after the
// metadata lands; the values it writes become the source of truth.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Highest phase number per course — used to bucket difficulty by relative
// depth so "advanced" means late-course regardless of how many phases a
// course has.
const MAX_PHASE = {
  ai: 6,
  dsa: 8,
  "system-design": 8,
  frontend: 9,
};

/**
 * Parse a freeform `duration` string into an estimated minute count.
 * Handles: "~2h", "~1.5–2h" (range → midpoint), "~15 min", "~15–20 min",
 * "~1 week", "15 min intro". Falls back to 60 if nothing parses.
 */
function parseMinutes(duration) {
  const d = duration.toLowerCase();
  if (d.includes("week")) {
    const n = parseFloat(d.match(/([\d.]+)\s*week/)?.[1] ?? "1");
    return Math.round(n * 5 * 60); // ~5 focused hours per "week" of project work
  }
  // Pull all numbers (handles ranges like "1.5–2").
  const nums = (d.match(/[\d.]+/g) ?? []).map(Number).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return 60;
  const value = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  if (d.includes("h")) return Math.round(value * 60);
  // Anything with "min" (or a bare number) is already minutes.
  return Math.round(value);
}

/**
 * Difficulty bucket. Phase 0, the welcome module, and any revision/recap
 * module are always "intro". Otherwise bucket by relative depth *within the
 * content phases*: we normalize (phaseNumber - 1) over (maxPhase - 1) so the
 * first content phase is always the floor (intro) and the last is always the
 * ceiling (advanced), independent of how many phases a course has. This gives
 * a balanced intro/core/advanced spread instead of flooding short courses
 * into "intro".
 */
function deriveDifficulty(courseId, phaseNumber, slug, title) {
  const lower = `${slug} ${title}`.toLowerCase();
  const isRevision = /revision|recap/.test(lower) || slug === "welcome";
  if (phaseNumber === 0 || isRevision) return "intro";
  const maxPhase = MAX_PHASE[courseId] || phaseNumber;
  // Avoid divide-by-zero for a hypothetical single-content-phase course.
  const span = Math.max(1, maxPhase - 1);
  const ratio = (phaseNumber - 1) / span;
  if (ratio < 0.34) return "intro";
  if (ratio < 0.7) return "core";
  return "advanced";
}

/**
 * Tags: phase name split into keyword tokens + a few title-keyword matches.
 * Deduped, lowercased, capped at 4 so cards stay tidy. Revision modules get a
 * "revision" tag; capstone/project-heavy modules get "project".
 */
const STOP = new Set(["the", "and", "in", "of", "to", "for", "a", "an", "with", "&", "you", "can"]);
function deriveTags(phase, slug, title, project) {
  const tags = [];
  for (const word of phase.split(/[\s&]+/)) {
    const w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length >= 3 && !STOP.has(w)) tags.push(w);
  }
  const lower = `${slug} ${title}`.toLowerCase();
  if (/revision|recap/.test(lower)) tags.push("revision");
  if (/capstone/.test(lower)) tags.push("capstone");
  // "project" tag when there's a real build (not a "No project" / revision).
  if (project && !/^no project|pure revision/i.test(project)) tags.push("project");
  // Dedupe, preserve order, cap at 4.
  return Array.from(new Set(tags)).slice(0, 4);
}

const FILES = [
  { id: "ai", path: join(root, "lib/courses/ai.ts") },
  { id: "dsa", path: join(root, "lib/courses/dsa.ts") },
  { id: "system-design", path: join(root, "lib/courses/system-design.ts") },
  { id: "frontend", path: join(root, "lib/courses/frontend.ts") },
];

// Matches a single-line module object. Captures the everything-before-status
// chunk and the status value so we can splice new fields in between.
const MODULE_RE = /^(\s*)(\{ slug: "([^"]+)",.*?)(, status: "(?:available|coming-soon)" \},?)\s*$/;

let totalUpdated = 0;
let totalSkipped = 0;

for (const { id, path } of FILES) {
  const src = readFileSync(path, "utf8");
  const lines = src.split("\n");
  let updated = 0;

  const out = lines.map((line) => {
    const m = MODULE_RE.exec(line);
    if (!m) return line;
    const [, indent, body, , statusTail] = m;

    // Idempotency: if already enriched, leave untouched.
    if (body.includes("estimatedMinutes:")) {
      totalSkipped++;
      return line;
    }

    // Extract the fields we derive from.
    const phaseNumber = Number(body.match(/phaseNumber: (\d+)/)?.[1] ?? "0");
    const phase = body.match(/phase: "([^"]*)"/)?.[1] ?? "";
    const title = body.match(/title: "([^"]*)"/)?.[1] ?? "";
    const duration = body.match(/duration: "([^"]*)"/)?.[1] ?? "";
    const project = body.match(/project: "([^"]*)"/)?.[1] ?? "";
    const slug = m[3];

    const difficulty = deriveDifficulty(id, phaseNumber, slug, title);
    const estimatedMinutes = parseMinutes(duration);
    const tags = deriveTags(phase, slug, title, project);

    const tagsLiteral = `[${tags.map((t) => `"${t}"`).join(", ")}]`;
    const inject = `, difficulty: "${difficulty}", estimatedMinutes: ${estimatedMinutes}, tags: ${tagsLiteral}`;

    updated++;
    return `${indent}${body}${inject}${statusTail}`;
  });

  writeFileSync(path, out.join("\n"));
  console.log(`${id}: enriched ${updated} modules`);
  totalUpdated += updated;
}

console.log(`\nTotal: ${totalUpdated} enriched, ${totalSkipped} already had metadata.`);
