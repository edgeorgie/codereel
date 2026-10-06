"use client";

import { useEffect, useRef, useState } from "react";
import { drawFrame } from "@/lib/render";
import { compositionDuration } from "@/lib/scene";
import type { Composition } from "@/lib/scene";

export default function Player({ comp }: { comp: Composition }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const duration = compositionDuration(comp);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawFrame(ctx, comp, Math.min(time, duration));
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

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        width={comp.width}
        height={comp.height}
        className="w-full rounded-lg border border-zinc-800 bg-black"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-md bg-blue-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-400"
        >
          {playing ? "Pause" : "Play"}
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
          className="flex-1"
          aria-label="Timeline"
        />
        <span className="w-24 text-right font-mono text-xs text-zinc-400">
          {time.toFixed(1)}s / {duration.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
