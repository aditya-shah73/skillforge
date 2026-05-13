"use client";

import { useEffect, useRef, useState } from "react";

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const mermaid = (await import("mermaid")).default;
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      // Re-initialize on every render so theme tracks system color scheme.
      // Mermaid caches config globally; passing the theme each time keeps it fresh.
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        themeVariables: {
          fontFamily: "var(--font-geist-sans)",
          // Sequence diagrams in particular need explicit overrides — the built-in
          // "dark" theme leaves the actor boxes light grey otherwise.
          ...(isDark
            ? {
                background: "#0f172a", // slate-900
                primaryColor: "#1e293b", // slate-800
                primaryTextColor: "#e2e8f0", // slate-200
                primaryBorderColor: "#475569", // slate-600
                lineColor: "#94a3b8", // slate-400
                secondaryColor: "#334155", // slate-700
                tertiaryColor: "#1e293b",
                // Sequence-diagram specific
                actorBkg: "#1e293b",
                actorBorder: "#475569",
                actorTextColor: "#e2e8f0",
                actorLineColor: "#94a3b8",
                signalColor: "#94a3b8",
                signalTextColor: "#e2e8f0",
                labelBoxBkgColor: "#1e293b",
                labelBoxBorderColor: "#475569",
                labelTextColor: "#e2e8f0",
                loopTextColor: "#e2e8f0",
                noteBkgColor: "#334155",
                noteTextColor: "#e2e8f0",
                noteBorderColor: "#475569",
                activationBkgColor: "#475569",
                activationBorderColor: "#94a3b8",
              }
            : {}),
        },
        flowchart: { curve: "basis" },
      });

      try {
        const id = `m${Math.random().toString(36).slice(2, 10)}`;
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled) setSvg(svg);
      } catch (e) {
        if (!cancelled) setSvg(`<pre>Diagram error: ${String(e)}</pre>`);
      }
    };

    render();

    // Re-render on color-scheme change so the diagram tracks light/dark toggles.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => render();
    mq.addEventListener("change", onChange);

    return () => {
      cancelled = true;
      mq.removeEventListener("change", onChange);
    };
  }, [chart]);

  return (
    <div
      ref={ref}
      className="my-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
