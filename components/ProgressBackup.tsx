"use client";

import { useRef, useState } from "react";
import { useProgress } from "@/lib/progress";

/**
 * Export / import the learner's progress as a JSON file. Lives on the
 * /achievements page. Because all progress is client-only (localStorage), this
 * is the *only* way to move it between browsers or back it up — there's no
 * account or server copy.
 *
 * Export: serialize the current snapshot and trigger a download via an object
 * URL. Import: read a chosen file, hand the text to importProgress (which does
 * the validation + migration), and surface a one-line status either way.
 */
export default function ProgressBackup() {
  const { exportProgress, importProgress } = useProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // null = idle; otherwise a transient status line shown under the buttons.
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const handleExport = () => {
    try {
      const json = exportProgress();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Date-stamp so multiple exports don't clobber each other in Downloads.
      a.download = `skillforge-progress-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus({ kind: "ok", text: "Progress exported." });
    } catch {
      // Blob/URL APIs can throw in locked-down environments — fail soft.
      setStatus({ kind: "error", text: "Couldn't export, try a different browser." });
    }
  };

  const handleImportClick = () => {
    setStatus(null);
    fileInputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input value so picking the same file twice re-fires onChange.
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const ok = importProgress(text);
      setStatus(
        ok
          ? { kind: "ok", text: "Progress imported. Your stats are updated." }
          : { kind: "error", text: "That file didn't look like a Skillforge export." },
      );
    };
    reader.onerror = () => {
      setStatus({ kind: "error", text: "Couldn't read that file." });
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-bold tracking-tight">Backup &amp; restore</h2>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        Your progress lives only in this browser. Export a file to back it up or
        move it to another device, then import it there.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Export progress
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Import progress
        </button>
        {/* Hidden native file picker driven by the Import button above. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFile}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {status && (
        <p
          role="status"
          className={`mt-3 text-xs ${
            status.kind === "ok"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}
