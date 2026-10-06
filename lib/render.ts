import { activeClips, clipProgress, typedText } from "./scene.ts";
import { tokenizeLine } from "./highlight.ts";
import type { Clip, Composition } from "./scene.ts";
import type { TokenKind } from "./highlight.ts";

export interface Theme {
  key: string;
  label: string;
  bgFrom: string;
  bgTo: string;
  glowA: string;
  glowB: string;
  panel: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  tokens: Record<TokenKind, string>;
}

export const THEMES: Theme[] = [
  {
    key: "midnight",
    label: "Midnight",
    bgFrom: "#0a0c14",
    bgTo: "#151a2e",
    glowA: "rgba(122,162,247,0.35)",
    glowB: "rgba(187,154,247,0.28)",
    panel: "rgba(16,20,34,0.86)",
    border: "rgba(255,255,255,0.10)",
    text: "#d6deeb",
    muted: "#5c6785",
    accent: "#7aa2f7",
    tokens: { plain: "#d6deeb", comment: "#637099", string: "#9ece6a", number: "#ff9e64", keyword: "#bb9af7", function: "#7dcfff" },
  },
  {
    key: "aurora",
    label: "Aurora",
    bgFrom: "#06141a",
    bgTo: "#0b2a2c",
    glowA: "rgba(45,212,191,0.35)",
    glowB: "rgba(56,189,248,0.28)",
    panel: "rgba(8,28,32,0.86)",
    border: "rgba(255,255,255,0.10)",
    text: "#d5f2ee",
    muted: "#4f7f7c",
    accent: "#2dd4bf",
    tokens: { plain: "#d5f2ee", comment: "#4f7f7c", string: "#a3e635", number: "#fbbf24", keyword: "#38bdf8", function: "#5eead4" },
  },
  {
    key: "sunset",
    label: "Sunset",
    bgFrom: "#1a0b14",
    bgTo: "#2d1424",
    glowA: "rgba(251,113,133,0.35)",
    glowB: "rgba(251,191,36,0.25)",
    panel: "rgba(34,14,26,0.86)",
    border: "rgba(255,255,255,0.10)",
    text: "#fde7ee",
    muted: "#8a5a6e",
    accent: "#fb7185",
    tokens: { plain: "#fde7ee", comment: "#8a5a6e", string: "#fcd34d", number: "#fb923c", keyword: "#f472b6", function: "#fda4af" },
  },
  {
    key: "paper",
    label: "Paper",
    bgFrom: "#f4efe6",
    bgTo: "#e7dfd0",
    glowA: "rgba(234,179,8,0.25)",
    glowB: "rgba(244,114,182,0.18)",
    panel: "rgba(255,255,255,0.92)",
    border: "rgba(0,0,0,0.08)",
    text: "#2b2b33",
    muted: "#9a9488",
    accent: "#d9480f",
    tokens: { plain: "#2b2b33", comment: "#9a9488", string: "#2f9e44", number: "#d9480f", keyword: "#7048e8", function: "#1971c2" },
  },
];

export function getTheme(key?: string): Theme {
  return THEMES.find((t) => t.key === key) ?? THEMES[0];
}

type Ctx = CanvasRenderingContext2D;

function ease(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

function wrap(ctx: Ctx, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawBackground(ctx: Ctx, comp: Composition, t: number, theme: Theme) {
  const { width: w, height: h } = comp;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, theme.bgFrom);
  g.addColorStop(1, theme.bgTo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const base = Math.max(w, h);
  const blobs: [number, number, string, number][] = [
    [0.2 + 0.08 * Math.sin(t * 0.6), 0.25 + 0.06 * Math.cos(t * 0.5), theme.glowA, 0.55],
    [0.8 + 0.07 * Math.cos(t * 0.45), 0.75 + 0.07 * Math.sin(t * 0.7), theme.glowB, 0.6],
  ];
  for (const [x, y, color, r] of blobs) {
    const rg = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * base);
    rg.addColorStop(0, color);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawTitle(ctx: Ctx, comp: Composition, clip: Clip, t: number, theme: Theme) {
  const p = clipProgress(clip, t);
  const fade = Math.min(1, 0.3 + p / 0.15, (1 - p) / 0.2);
  const base = Math.min(comp.width, comp.height);
  const size = Math.round(base * 0.085);
  ctx.save();
  ctx.globalAlpha = Math.max(0, fade);
  ctx.font = `800 ${size}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lines = wrap(ctx, clip.content, comp.width * 0.8);
  const lh = size * 1.2;
  const y0 = comp.height / 2 - ((lines.length - 1) * lh) / 2 + (1 - ease(Math.min(1, p / 0.25))) * 40;
  lines.forEach((l, i) => {
    ctx.fillStyle = theme.text;
    ctx.fillText(l, comp.width / 2, y0 + i * lh);
  });
  ctx.fillStyle = theme.accent;
  const barW = comp.width * 0.12 * ease(Math.min(1, p / 0.3));
  ctx.fillRect(comp.width / 2 - barW / 2, y0 + lines.length * lh, barW, Math.max(4, base * 0.006));
  ctx.restore();
}

function drawCode(ctx: Ctx, comp: Composition, clip: Clip, t: number, theme: Theme) {
  const base = Math.min(comp.width, comp.height);
  const margin = base * 0.07;
  const w = comp.width - margin * 2;
  const h = comp.height - margin * 2;
  const p = clipProgress(clip, t);
  const rise = (1 - ease(Math.min(1, p / 0.12))) * 30;
  ctx.save();
  ctx.translate(0, rise);
  ctx.globalAlpha = Math.min(1, 0.2 + p / 0.1);
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = base * 0.05;
  ctx.shadowOffsetY = base * 0.02;
  ctx.fillStyle = theme.panel;
  ctx.beginPath();
  ctx.roundRect(margin, margin, w, h, base * 0.025);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  const bar = base * 0.075;
  ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(margin + bar * 0.5 + i * bar * 0.4, margin + bar / 2, bar * 0.13, 0, Math.PI * 2);
    ctx.fill();
  });
  const fontSize = Math.round(base * 0.034);
  ctx.font = `${Math.round(fontSize * 0.7)}px ui-monospace, Menlo, Consolas, monospace`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = theme.muted;
  ctx.fillText(clip.lang ?? "", margin + w - bar * 0.5, margin + bar / 2);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin, margin + bar, w, h - bar, base * 0.025);
  ctx.clip();
  ctx.font = `${fontSize}px ui-monospace, Menlo, Consolas, monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const typed = typedText(clip, t);
  const all = typed.split("\n");
  const lh = fontSize * 1.55;
  const maxLines = Math.max(1, Math.floor((h - bar - fontSize) / lh));
  const startIndex = Math.max(0, all.length - maxLines);
  const gutter = fontSize * 2.4;
  const x0 = margin + fontSize * 0.9;
  const y0 = margin + bar + fontSize * 0.5;
  let caretX = x0 + gutter;
  let caretY = y0;
  all.slice(startIndex).forEach((line, i) => {
    const y = y0 + i * lh;
    ctx.fillStyle = theme.muted;
    ctx.fillText(String(startIndex + i + 1), x0, y);
    let x = x0 + gutter;
    for (const tok of tokenizeLine(line)) {
      ctx.fillStyle = theme.tokens[tok.kind];
      ctx.fillText(tok.text, x, y);
      x += ctx.measureText(tok.text).width;
    }
    caretX = x;
    caretY = y;
  });
  if (p < 0.7 || Math.floor(t * 2) % 2 === 0) {
    ctx.fillStyle = theme.accent;
    ctx.fillRect(caretX + 3, caretY, fontSize * 0.5, fontSize * 1.15);
  }
  ctx.restore();
  ctx.restore();
}

/** Draws the composition at time t on a canvas context. Pure with respect to t: same input, same frame. */
export function drawFrame(ctx: Ctx, comp: Composition, t: number) {
  const theme = getTheme(comp.theme);
  drawBackground(ctx, comp, t, theme);
  for (const clip of activeClips(comp, t)) {
    if (clip.type === "code") drawCode(ctx, comp, clip, t, theme);
    else if (clip.type === "text") drawTitle(ctx, comp, clip, t, theme);
  }
}
