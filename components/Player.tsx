"use client";

import { useEffect, useRef, useState } from "react";
import { drawFrame } from "@/lib/render";
import { compositionDuration } from "@/lib/scene";
import type { Composition } from "@/lib/scene";

export default function Player({ comp }: { comp: Composition }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const duration = compositionDuration(comp);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawFrame(ctx, comp, Math.min(time, Math.max(0, duration - 0.001)));
  }, [comp, time, duration]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime((t) => {
        const next = t + dt;
        if (next >= duration) {
          setPlaying(false);
          return duration;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration]);

  const toggle = () => {
    if (!playing && time >= duration) setTime(0);
    setPlaying((p) => !p);
  };

  const pct = duration > 0 ? (Math.min(time, duration) / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl shadow-black/50 backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(122,162,247,0.12),transparent_60%)]" />
        <canvas
          ref={canvasRef}
          width={comp.width}
          height={comp.height}
          style={{ aspectRatio: `${comp.width} / ${comp.height}`, maxHeight: 560 }}
          className="relative max-w-full rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/10"
        />
      </div>
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500 text-white shadow-lg shadow-violet-500/30 transition hover:scale-105 active:scale-95"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="3.5" height="12" rx="1" /><rect x="8.5" y="1" width="3.5" height="12" rx="1" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z" /></svg>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={Math.min(time, duration)}
          onChange={(e) => {
            setPlaying(false);
            setTime(Number(e.target.value));
          }}
          style={{ background: `linear-gradient(to right, #8b9cf7 ${pct}%, rgba(255,255,255,0.12) ${pct}%)` }}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full accent-violet-400"
          aria-label="Timeline"
        />
        <span className="w-24 text-right font-mono text-xs tabular-nums text-zinc-400">
          {time.toFixed(1)}s / {duration.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
