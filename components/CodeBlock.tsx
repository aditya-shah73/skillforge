"use client";

import React, { useState } from "react";

/**
 * Lightweight syntax highlighter for Java + pom.xml-style code blocks
 * used in the course. No external deps — we do it with regex because
 * the code snippets here are small and well-behaved.
 *
 * Client component: the syntax-highlighting tokenizer below is pure (plain
 * functions, no server-only deps) and runs fine on the client, while the
 * copy-to-clipboard button needs `useState` + the Clipboard API.
 *
 * Color scheme (works on the dark pre background):
 *  - comments:   muted slate / italic
 *  - keywords:   purple
 *  - annotations (@Service, @Bean): amber
 *  - types (PascalCase): cyan/teal
 *  - strings:    green
 *  - numbers:    orange
 *  - default:    light slate (from <pre> color: inherit)
 */

type Lang = "java" | "plain" | "ts" | "tsx";

const JAVA_KEYWORDS = new Set([
  "public", "private", "protected", "final", "static", "class", "interface",
  "record", "extends", "implements", "return", "new", "this", "void", "if",
  "else", "while", "for", "do", "switch", "case", "break", "continue",
  "throw", "throws", "try", "catch", "finally", "import", "package",
  "true", "false", "null", "int", "long", "double", "float", "boolean",
  "char", "byte", "short", "String",
]);

// Token types we produce per line
type Tok =
  | { t: "text"; v: string }
  | { t: "comment"; v: string }
  | { t: "string"; v: string }
  | { t: "number"; v: string }
  | { t: "keyword"; v: string }
  | { t: "annotation"; v: string }
  | { t: "type"; v: string };

function tokenizeJavaLine(line: string): Tok[] {
  const out: Tok[] = [];

  // Handle whole-line comments first (including "// ──── section banners")
  const commentIdx = findCommentStart(line);
  if (commentIdx !== -1) {
    const before = line.slice(0, commentIdx);
    const comment = line.slice(commentIdx);
    if (before) out.push(...tokenizeJavaLine(before));
    out.push({ t: "comment", v: comment });
    return out;
  }

  // Walk the line and peel off tokens
  let i = 0;
  while (i < line.length) {
    const ch = line[i];

    // String literal
    if (ch === '"') {
      let j = i + 1;
      while (j < line.length && line[j] !== '"') {
        if (line[j] === "\\" && j + 1 < line.length) j += 2;
        else j++;
      }
      out.push({ t: "string", v: line.slice(i, Math.min(j + 1, line.length)) });
      i = j + 1;
      continue;
    }

    // Annotation (@Something)
    if (ch === "@" && /[A-Za-z_]/.test(line[i + 1] || "")) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      out.push({ t: "annotation", v: line.slice(i, j) });
      i = j;
      continue;
    }

    // Identifier / keyword / type
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (JAVA_KEYWORDS.has(word)) {
        out.push({ t: "keyword", v: word });
      } else if (/^[A-Z]/.test(word)) {
        // PascalCase → treat as type / class name
        out.push({ t: "type", v: word });
      } else {
        out.push({ t: "text", v: word });
      }
      i = j;
      continue;
    }

    // Number (including 200_000 style)
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < line.length && /[0-9_.]/.test(line[j])) j++;
      // Trailing type suffix (L, d, f)
      if (j < line.length && /[LlDdFf]/.test(line[j])) j++;
      out.push({ t: "number", v: line.slice(i, j) });
      i = j;
      continue;
    }

    // Anything else (operators, punctuation, whitespace)
    out.push({ t: "text", v: ch });
    i++;
  }

  return out;
}

// Find the start of a "//" comment, ignoring // inside strings
function findCommentStart(line: string): number {
  let inStr = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i - 1] !== "\\") inStr = !inStr;
    if (!inStr && ch === "/" && line[i + 1] === "/") return i;
  }
  return -1;
}

const CLASSES: Record<Tok["t"], string> = {
  text: "text-slate-200",
  comment: "text-slate-400 italic",
  string: "text-emerald-300",
  number: "text-orange-300",
  keyword: "text-purple-300 font-semibold",
  annotation: "text-amber-300",
  type: "text-cyan-300",
};

function renderLine(line: string, lang: Lang, key: number): React.ReactNode {
  if (lang !== "java") {
    // Plain: still highlight // comments so section banners pop
    const idx = findCommentStart(line);
    if (idx === -1) return <span key={key}>{line || "\u00A0"}</span>;
    return (
      <span key={key}>
        {line.slice(0, idx)}
        <span className={CLASSES.comment}>{line.slice(idx)}</span>
      </span>
    );
  }
  const toks = tokenizeJavaLine(line);
  return (
    <span key={key}>
      {toks.length === 0
        ? "\u00A0"
        : toks.map((tok, i) => (
            <span key={i} className={CLASSES[tok.t]}>
              {tok.v}
            </span>
          ))}
    </span>
  );
}

/**
 * Copy-to-clipboard button for a code block. Copies the raw, un-highlighted
 * source so what lands on the clipboard is exactly what the author wrote.
 * Shows a transient "Copied" confirmation, with a graceful fallback if the
 * Clipboard API is unavailable (e.g. non-secure context).
 */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (insecure context / permissions) — no-op.
      // The code stays selectable in the <pre>, so the user can still copy it.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
      className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 font-mono text-[11px] font-medium text-slate-300 transition hover:border-slate-500 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
    >
      {copied ? (
        <>
          <span aria-hidden>✓</span>
          Copied
        </>
      ) : (
        <>
          <span aria-hidden>⧉</span>
          Copy
        </>
      )}
    </button>
  );
}

export default function CodeBlock({
  children,
  lang = "java",
  caption,
}: {
  children: string;
  lang?: Lang;
  caption?: string;
}) {
  const source = children.replace(/\n$/, "");
  const lines = source.split("\n");
  return (
    <div className="not-prose group relative my-5 overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-sm">
      {/* Header bar: always rendered so the copy button has a home. When a
          caption is supplied we also show the traffic-light dots + label. */}
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2 font-mono text-xs text-slate-400">
        {caption ? (
          <>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500/70" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            <span className="ml-2 truncate">{caption}</span>
          </>
        ) : (
          // No caption: label the language (skip the noisy "plain" case).
          <span className="tracking-wider uppercase">
            {lang === "plain" ? "" : lang}
          </span>
        )}
        <div className="ml-auto">
          <CopyButton code={source} />
        </div>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-slate-200">
        <code>
          {lines.map((line, i) => (
            <React.Fragment key={i}>
              {renderLine(line, lang, i)}
              {"\n"}
            </React.Fragment>
          ))}
        </code>
      </pre>
    </div>
  );
}
