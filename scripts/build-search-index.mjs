// Build-time full-text search index.
//
// Reads every module page at app/courses/<course>/modules/<slug>/page.tsx,
// extracts readable plain text (prose, headings, callouts, code identifiers),
// truncates each module to a bounded size, and writes lib/search-index.json
// keyed by the namespaced module key "<courseId>/<slug>".
//
// Wired as `prebuild` (see package.json) so the index can never go stale
// against the content. The generated JSON is also committed so `next dev`
// and any consumer has it without a build step.
//
// Run manually with: node scripts/build-search-index.mjs

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const COURSES = ["ai", "dsa", "system-design", "frontend"];

// Cap each module's indexed text. Enough to catch body keywords without
// bloating the bundle — 183 modules × ~2KB ≈ 350KB JSON, gzip ~tenth of that.
const MAX_CHARS = 2000;

/**
 * Reduce a TSX module page to searchable plain text. This is deliberately
 * lossy — we want keywords, not fidelity:
 *   - drop import lines and the leading directive
 *   - strip JSX tags (<Foo .../>, </Foo>, <div ...>)
 *   - strip JSX expression braces but keep their inner identifiers
 *   - decode the handful of HTML entities our content actually uses
 *   - collapse whitespace and dedupe nothing (substring match handles repeats)
 */
function extractText(src) {
  let s = src;

  // Drop import / "use client" lines — pure noise for search.
  s = s.replace(/^\s*import .*$/gm, " ");
  s = s.replace(/^\s*["']use client["'];?\s*$/gm, " ");

  // Strip block & line comments.
  s = s.replace(/\/\*[\s\S]*?\*\//g, " ");
  s = s.replace(/^\s*\/\/.*$/gm, " ");

  // Strip JSX/HTML tags but keep the text between them.
  s = s.replace(/<\/?[A-Za-z][^>]*>/g, " ");

  // Mermaid/style directives inside template literals add noise (fill:#fff,
  // flowchart LR, etc). Drop hex colors and a few diagram keywords.
  s = s.replace(/#[0-9a-fA-F]{3,8}\b/g, " ");

  // Decode the entities our content uses.
  s = s
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");

  // Remove JSX/JS punctuation that isn't useful as a search token. Keep
  // letters, numbers, and a few word-ish separators.
  s = s.replace(/[{}()[\]<>`$|\\=;]+/g, " ");

  // Collapse whitespace.
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

const index = {};
let count = 0;

for (const course of COURSES) {
  const modulesDir = join(root, "app/courses", course, "modules");
  if (!existsSync(modulesDir)) continue;

  const slugs = readdirSync(modulesDir).filter((name) => {
    const p = join(modulesDir, name);
    return statSync(p).isDirectory() && existsSync(join(p, "page.tsx"));
  });

  for (const slug of slugs) {
    const pagePath = join(modulesDir, slug, "page.tsx");
    const src = readFileSync(pagePath, "utf8");
    const text = extractText(src).slice(0, MAX_CHARS).toLowerCase();
    index[`${course}/${slug}`] = text;
    count++;
  }
}

const outPath = join(root, "lib/search-index.json");
// Stable key order so the committed file has a deterministic diff.
const ordered = {};
for (const key of Object.keys(index).sort()) ordered[key] = index[key];
writeFileSync(outPath, JSON.stringify(ordered) + "\n");

console.log(`Wrote ${outPath} — ${count} modules indexed.`);
