"use client";

import { useEffect, useRef, useState } from "react";
import { handlesOwnKeys } from "@/lib/keys";
import { drawFrame } from "@/lib/render";
import { compositionDuration } from "@/lib/scene";
import type { Composition } from "@/lib/scene";

/** The stage: the canvas morphs smoothly between aspect ratios. The dock below holds play and the scrubber. */
export default function Player({ comp }: { comp: Composition }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const duration = compositionDuration(comp);
  const portrait = comp.height > comp.width;

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.code === "Space" && !handlesOwnKeys(el.tagName, el.getAttribute("role"), el.isContentEditable)) {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = () => {
    if (!playing && time >= duration) setTime(0);
    setPlaying((p) => !p);
  };

  const pct = duration > 0 ? (Math.min(time, duration) / duration) * 100 : 0;
  const code = comp.clips.find((c) => c.type === "code");
  const typingStart = code ? (code.start / duration) * 100 : 0;
  const typingEnd = code ? ((code.start + code.duration * 0.7) / duration) * 100 : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="grid min-h-0 flex-1 place-items-center p-4 sm:p-8" style={{ containerType: "size" }}>
        <div
          className="stage-box relative overflow-hidden rounded-xl shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ring-1 ring-line"
          style={{
            aspectRatio: `${comp.width} / ${comp.height}`,
            width: `min(100cqw, ${(comp.width / comp.height).toFixed(4)} * 100cqh, ${portrait ? 520 : 1000}px)`,
          }}
        >
          <canvas ref={canvasRef} width={comp.width} height={comp.height} className="absolute inset-0 h-full w-full object-contain" />
        </div>
      </div>

      <div className="mx-auto mb-6 flex w-full max-w-3xl items-center gap-4 rounded-full bg-panel px-4 py-2.5 ring-1 ring-line">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-bg transition hover:scale-105 active:scale-90"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="3.5" height="12" rx="1" /><rect x="8.5" y="1" width="3.5" height="12" rx="1" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z" /></svg>
          )}
        </button>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
          <div className="pointer-events-none absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-lime/25" style={{ left: `${typingStart}%`, width: `${typingEnd - typingStart}%` }} />
          <div className="pointer-events-none absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-lime" style={{ width: `${pct}%` }} />
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
            className="scrub relative w-full"
            aria-label="Timeline"
          />
        </div>
        <span className="w-28 shrink-0 text-right font-mono text-xs tabular-nums text-muted">
          {time.toFixed(1)} / {duration.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
