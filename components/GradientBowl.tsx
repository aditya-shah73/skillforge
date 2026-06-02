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
    <div className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/50">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-lg">🎢</span> The bowl you&apos;re rolling down
        </h4>
      </div>
      <div className="space-y-4 p-5">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flex justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
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
              className="mt-1 w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
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
              className="mt-1 w-full accent-amber-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={manualStep}
            disabled={stepping}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            Step once
          </button>
          <button
            onClick={() => setStepping(true)}
            disabled={stepping}
            className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 disabled:opacity-50"
          >
            {stepping ? "Descending..." : "Run 60 steps"}
          </button>
          <button
            onClick={() => resetAt(-2)}
            disabled={stepping}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Reset
          </button>
        </div>

        {overshoot && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            ⚠️ Learning rate &gt; 1 on this curve, you&apos;ll overshoot and may diverge. Watch the ball fly off.
          </div>
        )}
        {diverging && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            💥 Diverged. This is what happens in real training when the LR is too big.
          </div>
        )}
      </div>
    </div>
  );
}
