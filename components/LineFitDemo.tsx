"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useProgress } from "@/lib/progress";
import { useTokey } from "@/components/Tokey";

// House size (sqft, scaled 1-10) vs price (scaled 100-500k)
const DATA: { x: number; y: number }[] = [
  { x: 1.2, y: 140 },
  { x: 2.1, y: 180 },
  { x: 2.8, y: 210 },
  { x: 3.5, y: 260 },
  { x: 4.3, y: 290 },
  { x: 5.0, y: 340 },
  { x: 5.8, y: 360 },
  { x: 6.6, y: 400 },
  { x: 7.5, y: 430 },
  { x: 8.4, y: 470 },
];

// The "true" best fit (computed once, offline): slope ≈ 46, intercept ≈ 90
const BEST = { m: 46, b: 90, mse: 0 };

function computeMSE(m: number, b: number) {
  const n = DATA.length;
  let sum = 0;
  for (const p of DATA) {
    const pred = m * p.x + b;
    sum += (pred - p.y) ** 2;
  }
  return sum / n;
}
BEST.mse = computeMSE(BEST.m, BEST.b);

export default function LineFitDemo() {
  const [m, setM] = useState(20);
  const [b, setB] = useState(50);
  const [autoFit, setAutoFit] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const rafRef = useRef<number | null>(null);
  const { unlockEasterEgg } = useProgress();
  const { say } = useTokey();

  const mse = useMemo(() => computeMSE(m, b), [m, b]);
  const isGood = mse < BEST.mse * 1.05; // within 5%

  useEffect(() => {
    if (isGood && !unlocked) {
      setUnlocked(true);
      const wasNew = unlockEasterEgg("line-fitter");
      if (wasNew) {
        say({ mood: "celebrate", text: "You found the fit by hand! +25 XP.", duration: 4000 });
      }
    }
  }, [isGood, unlocked, unlockEasterEgg, say]);

  // Auto-fit = gradient descent animation
  useEffect(() => {
    if (!autoFit) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }
    let curM = m;
    let curB = b;
    const lr = 0.008;
    let step = 0;

    const tick = () => {
      // Compute gradients
      let gm = 0;
      let gb = 0;
      for (const p of DATA) {
        const pred = curM * p.x + curB;
        const err = pred - p.y;
        gm += (2 / DATA.length) * err * p.x;
        gb += (2 / DATA.length) * err;
      }
      curM -= lr * gm;
      curB -= lr * gb;
      setM(Number(curM.toFixed(2)));
      setB(Number(curB.toFixed(2)));
      step++;
      if (step < 200 && Math.abs(gm) + Math.abs(gb) > 0.2) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAutoFit(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFit]);

  // SVG dimensions
  const W = 480;
  const H = 300;
  const PAD = 36;
  const xMin = 0;
  const xMax = 10;
  const yMin = 0;
  const yMax = 550;

  const xScale = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (W - PAD * 2);
  const yScale = (y: number) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - PAD * 2);

  const lineStart = { x: xMin, y: m * xMin + b };
  const lineEnd = { x: xMax, y: m * xMax + b };

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/50">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-lg">📈</span> Fit the line yourself
        </h4>
        <span className="text-xs text-slate-500">House size → price</span>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex justify-center">
          <svg width={W} height={H} className="max-w-full">
            {/* Grid — explicit stroke w/ opacity works on any bg */}
            {[0, 100, 200, 300, 400, 500].map((y) => (
              <line
                key={`gy-${y}`}
                x1={PAD}
                x2={W - PAD}
                y1={yScale(y)}
                y2={yScale(y)}
                stroke="#94a3b8"
                strokeOpacity={0.25}
                strokeWidth={1}
              />
            ))}
            {/* Y-axis gridline labels */}
            {[0, 100, 200, 300, 400, 500].map((y) => (
              <text
                key={`gy-label-${y}`}
                x={PAD - 4}
                y={yScale(y) + 3}
                fontSize={9}
                fill="#94a3b8"
                textAnchor="end"
              >
                {y}
              </text>
            ))}
            {/* Axes labels */}
            <text x={PAD} y={H - 10} fontSize={10} fill="#94a3b8">Size (1000 sqft) →</text>
            <text x={4} y={PAD - 10} fontSize={10} fill="#94a3b8">Price ($k)</text>
            {/* The fit line — draw BEFORE residuals so residuals overlay it */}
            <line
              x1={xScale(lineStart.x)}
              y1={yScale(lineStart.y)}
              x2={xScale(lineEnd.x)}
              y2={yScale(lineEnd.y)}
              stroke={isGood ? "#10b981" : "#6366f1"}
              strokeWidth={3}
              style={{ transition: "stroke 0.3s" }}
            />
            {/* Residual lines (errors) — bright red, visible on both themes */}
            {DATA.map((p, i) => {
              const pred = m * p.x + b;
              return (
                <line
                  key={`r-${i}`}
                  x1={xScale(p.x)}
                  x2={xScale(p.x)}
                  y1={yScale(p.y)}
                  y2={yScale(pred)}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  opacity={0.9}
                />
              );
            })}
            {/* Data points — bright orange so they're visible on any background */}
            {DATA.map((p, i) => (
              <circle
                key={`p-${i}`}
                cx={xScale(p.x)}
                cy={yScale(p.y)}
                r={6}
                fill="#fb923c"
                stroke="#7c2d12"
                strokeWidth={1.5}
              />
            ))}
          </svg>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flex justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <span>Slope (m)</span>
              <span className="font-mono">{m.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={80}
              step={0.5}
              value={m}
              onChange={(e) => setM(Number(e.target.value))}
              className="mt-1 w-full accent-indigo-500"
              disabled={autoFit}
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <span>Intercept (b)</span>
              <span className="font-mono">{b.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min={-50}
              max={300}
              step={1}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="mt-1 w-full accent-indigo-500"
              disabled={autoFit}
            />
          </div>
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-3">
          <Stat label="Prediction" value={`price = ${m.toFixed(0)} × size + ${b.toFixed(0)}`} wide />
          <Stat label="Loss (MSE)" value={mse.toFixed(0)} highlight={isGood} />
          <button
            onClick={() => setAutoFit(true)}
            disabled={autoFit}
            className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {autoFit ? "🏃 Descending..." : "✨ Let gradient descent solve it"}
          </button>
        </div>

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
          💡 <strong>Red dashed lines</strong> are the errors — each point&apos;s distance from your line. The loss
          squares &amp; averages those. Get under <span className="font-mono">{(BEST.mse * 1.05).toFixed(0)}</span> by hand for an easter egg.
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight, wide }: { label: string; value: string | number; highlight?: boolean; wide?: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${wide ? "sm:col-span-1" : ""} ${highlight ? "border border-emerald-300 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60" : "border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`font-mono text-sm font-semibold ${highlight ? "text-emerald-700 dark:text-emerald-300" : ""}`}>{value}</div>
    </div>
  );
}
