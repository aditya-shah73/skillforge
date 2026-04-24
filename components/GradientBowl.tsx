"use client";

import { useEffect, useRef, useState } from "react";

// A simple scalar loss: L(w) = (w - 3)^2 + 0.5
// The minimum is at w=3, loss=0.5
function loss(w: number) {
  return (w - 3) ** 2 + 0.5;
}
function grad(w: number) {
  return 2 * (w - 3);
}

export default function GradientBowl() {
  const [w, setW] = useState(-2);
  const [lr, setLr] = useState(0.2);
  const [stepping, setStepping] = useState(false);
  const [history, setHistory] = useState<{ w: number; l: number }[]>([{ w: -2, l: loss(-2) }]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stepping) return;
    let curW = w;
    let step = 0;
    const tick = () => {
      const g = grad(curW);
      curW = curW - lr * g;
      const newL = loss(curW);
      setW(Number(curW.toFixed(3)));
      setHistory((h) => [...h, { w: curW, l: newL }].slice(-50));
      step++;
      if (step < 60 && Math.abs(g) > 0.01 && Math.abs(curW) < 20) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setStepping(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepping]);

  function resetAt(newW: number) {
    setW(newW);
    setHistory([{ w: newW, l: loss(newW) }]);
  }

  function manualStep() {
    const g = grad(w);
    const newW = w - lr * g;
    setW(Number(newW.toFixed(3)));
    setHistory((h) => [...h, { w: newW, l: loss(newW) }].slice(-50));
  }

  const W = 480;
  const H = 240;
  const PAD = 30;
  const wMin = -5;
  const wMax = 11;
  const lMin = 0;
  const lMax = 30;

  const xScale = (x: number) => PAD + ((x - wMin) / (wMax - wMin)) * (W - PAD * 2);
  const yScale = (y: number) => H - PAD - ((y - lMin) / (lMax - lMin)) * (H - PAD * 2);

  const curvePoints = Array.from({ length: 80 }, (_, i) => {
    const x = wMin + (i / 79) * (wMax - wMin);
    return `${xScale(x)},${yScale(loss(x))}`;
  }).join(" ");

  const overshoot = lr > 1;
  const diverging = Math.abs(w) > 15;

  return (
    <div className="my-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <span className="text-lg">🎢</span> The bowl you&apos;re rolling down
        </h4>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex justify-center">
          <svg width={W} height={H} className="max-w-full">
            {/* Horizontal gridlines (loss values) */}
            {[0, 10, 20, 30].map((ly) => (
              <line
                key={`gh-${ly}`}
                x1={PAD}
                x2={W - PAD}
                y1={yScale(ly)}
                y2={yScale(ly)}
                stroke="#94a3b8"
                strokeOpacity={0.2}
                strokeWidth={1}
              />
            ))}
            {/* Vertical gridlines (weight values) */}
            {[-5, 0, 3, 5, 10].map((lx) => (
              <line
                key={`gv-${lx}`}
                x1={xScale(lx)}
                x2={xScale(lx)}
                y1={PAD}
                y2={H - PAD}
                stroke="#94a3b8"
                strokeOpacity={lx === 3 ? 0.35 : 0.15}
                strokeDasharray={lx === 3 ? "2 2" : undefined}
                strokeWidth={1}
              />
            ))}
            {/* Axis tick labels */}
            {[-5, 0, 3, 5, 10].map((lx) => (
              <text
                key={`tx-${lx}`}
                x={xScale(lx)}
                y={H - PAD + 14}
                fontSize={9}
                fill="#94a3b8"
                textAnchor="middle"
              >
                {lx}
              </text>
            ))}
            <text x={W / 2} y={H - 4} fontSize={10} fill="#94a3b8" textAnchor="middle">weight w →</text>
            <text x={4} y={PAD - 10} fontSize={10} fill="#94a3b8">Loss</text>

            {/* Loss curve */}
            <polyline fill="none" stroke="#818cf8" strokeWidth={2.5} points={curvePoints} />
            {/* History trail */}
            {history.map((h, i) => (
              <circle
                key={i}
                cx={xScale(h.w)}
                cy={yScale(h.l)}
                r={3}
                fill="#f59e0b"
                opacity={0.25 + (0.75 * i) / Math.max(history.length - 1, 1)}
              />
            ))}
            {/* Current ball */}
            <circle cx={xScale(w)} cy={yScale(loss(w))} r={8} fill="#f59e0b" stroke="#7c2d12" strokeWidth={2} />
            {/* Minimum marker */}
            <circle cx={xScale(3)} cy={yScale(0.5)} r={5} fill="#10b981" stroke="#064e3b" strokeWidth={1.5} />
            <text x={xScale(3) + 10} y={yScale(0.5) + 4} fontSize={10} fill="#10b981" fontWeight={600}>minimum (w=3)</text>
          </svg>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex justify-between">
              <span>Weight w (start)</span>
              <span className="font-mono">{w.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={-5}
              max={11}
              step={0.1}
              value={w}
              onChange={(e) => resetAt(Number(e.target.value))}
              disabled={stepping}
              className="w-full mt-1 accent-amber-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex justify-between">
              <span>Learning rate</span>
              <span className={`font-mono ${overshoot ? "text-rose-600 dark:text-rose-400" : ""}`}>{lr.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0.01}
              max={1.2}
              step={0.01}
              value={lr}
              onChange={(e) => setLr(Number(e.target.value))}
              disabled={stepping}
              className="w-full mt-1 accent-amber-500"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={manualStep}
            disabled={stepping}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold transition disabled:opacity-50"
          >
            Step once
          </button>
          <button
            onClick={() => setStepping(true)}
            disabled={stepping}
            className="px-4 py-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:scale-105 transition disabled:opacity-50"
          >
            {stepping ? "Descending..." : "Run 60 steps"}
          </button>
          <button
            onClick={() => resetAt(-2)}
            disabled={stepping}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        {overshoot && (
          <div className="rounded-lg px-3 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200">
            ⚠️ Learning rate &gt; 1 on this curve — you&apos;ll overshoot and may diverge. Watch the ball fly off.
          </div>
        )}
        {diverging && (
          <div className="rounded-lg px-3 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200">
            💥 Diverged. This is what happens in real training when the LR is too big.
          </div>
        )}
      </div>
    </div>
  );
}
