import { activeClips, clipProgress, typedText } from "./scene.ts";
import type { Clip, Composition } from "./scene.ts";

export interface Theme {
  background: string;
  panel: string;
  text: string;
  accent: string;
  muted: string;
}

export const DARK_THEME: Theme = {
  background: "#0b0d12",
  panel: "#151922",
  text: "#e6edf3",
  accent: "#7aa2f7",
  muted: "#6b7280",
};

type Ctx = CanvasRenderingContext2D;

function ease(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

function drawText(ctx: Ctx, comp: Composition, clip: Clip, t: number, theme: Theme) {
  const p = clipProgress(clip, t);
  const fade = Math.min(1, p / 0.15, (1 - p) / 0.15);
  ctx.save();
  ctx.globalAlpha = Math.max(0, fade);
  ctx.fillStyle = theme.text;
  ctx.font = `700 ${Math.round(comp.height * 0.07)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(0, (1 - ease(Math.min(1, p / 0.2))) * 30);
  ctx.fillText(clip.content, comp.width / 2, comp.height / 2);
  ctx.restore();
}

function drawCode(ctx: Ctx, comp: Composition, clip: Clip, t: number, theme: Theme) {
  const margin = comp.width * 0.08;
  const w = comp.width - margin * 2;
  const h = comp.height - margin * 2;
  ctx.fillStyle = theme.panel;
  ctx.beginPath();
  ctx.roundRect(margin, margin, w, h, 24);
  ctx.fill();
  const dots = ["#ff5f56", "#ffbd2e", "#27c93f"];
  dots.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(margin + 40 + i * 36, margin + 40, 10, 0, Math.PI * 2);
    ctx.fill();
  });
  const fontSize = Math.round(comp.height * 0.032);
  ctx.font = `${fontSize}px ui-monospace, Menlo, Consolas, monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const lines = typedText(clip, t).split("\n");
  const lineHeight = fontSize * 1.5;
  const maxLines = Math.floor((h - 100) / lineHeight);
  const visible = lines.slice(-maxLines);
  visible.forEach((line, i) => {
    ctx.fillStyle = theme.text;
    ctx.fillText(line, margin + 48, margin + 90 + i * lineHeight);
  });
  const typing = clipProgress(clip, t) < 0.7;
  if (typing || Math.floor(t * 2) % 2 === 0) {
    const last = visible[visible.length - 1] ?? "";
    const x = margin + 48 + ctx.measureText(last).width + 4;
    const y = margin + 90 + (visible.length - 1) * lineHeight;
    ctx.fillStyle = theme.accent;
    ctx.fillRect(x, y, fontSize * 0.55, fontSize * 1.2);
  }
}

/** Draws the composition at time t on a canvas context. Pure with respect to t: same input, same frame. */
export function drawFrame(ctx: Ctx, comp: Composition, t: number, theme: Theme = DARK_THEME) {
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, comp.width, comp.height);
  for (const clip of activeClips(comp, t)) {
    if (clip.type === "code") drawCode(ctx, comp, clip, t, theme);
    else if (clip.type === "text") drawText(ctx, comp, clip, t, theme);
  }
}
