export type ClipType = "text" | "code" | "image";

export interface Clip {
  id: string;
  type: ClipType;
  start: number;
  duration: number;
  track: number;
  content: string;
  lang?: string;
}

export interface Composition {
  id: string;
  width: number;
  height: number;
  fps: number;
  theme?: string;
  clips: Clip[];
}

export const MAX_DURATION = 60;

export function compositionDuration(comp: Composition): number {
  return comp.clips.reduce((max, c) => Math.max(max, c.start + c.duration), 0);
}

export function activeClips(comp: Composition, t: number): Clip[] {
  return comp.clips
    .filter((c) => t >= c.start && t < c.start + c.duration)
    .sort((a, b) => a.track - b.track);
}

export function clipProgress(clip: Clip, t: number): number {
  if (clip.duration <= 0) return 1;
  return Math.min(1, Math.max(0, (t - clip.start) / clip.duration));
}

/** Characters of a code or text clip visible at time t, typed over the first 70% of its duration. */
export function typedText(clip: Clip, t: number): string {
  const p = Math.min(1, clipProgress(clip, t) / 0.7);
  return clip.content.slice(0, Math.floor(clip.content.length * p));
}

export function frameCount(comp: Composition): number {
  return Math.ceil(compositionDuration(comp) * comp.fps);
}

export function validate(comp: Composition): string[] {
  const errors: string[] = [];
  if (!comp.id) errors.push("id is required");
  if (comp.width <= 0 || comp.height <= 0) errors.push("width and height must be positive");
  if (comp.fps < 1 || comp.fps > 60) errors.push("fps must be between 1 and 60");
  const ids = new Set<string>();
  for (const c of comp.clips) {
    if (ids.has(c.id)) errors.push(`duplicate clip id: ${c.id}`);
    ids.add(c.id);
    if (c.start < 0) errors.push(`clip ${c.id}: start must be >= 0`);
    if (c.duration <= 0) errors.push(`clip ${c.id}: duration must be > 0`);
  }
  if (compositionDuration(comp) > MAX_DURATION) {
    errors.push(`duration exceeds ${MAX_DURATION}s`);
  }
  return errors;
}

export interface AspectPreset {
  key: string;
  label: string;
  hint: string;
  width: number;
  height: number;
}

export const ASPECTS: AspectPreset[] = [
  { key: "wide", label: "16:9", hint: "YouTube", width: 1920, height: 1080 },
  { key: "vertical", label: "9:16", hint: "Reels, TikTok, Shorts", width: 1080, height: 1920 },
  { key: "square", label: "1:1", hint: "Feed", width: 1080, height: 1080 },
  { key: "portrait", label: "4:5", hint: "Instagram, LinkedIn", width: 1080, height: 1350 },
];

export interface SnippetOptions {
  lang?: string;
  title?: string;
  aspect?: string;
  theme?: string;
  charsPerSecond?: number;
}

export function snippetComposition(code: string, opts: SnippetOptions | string = {}, titleArg = ""): Composition {
  const o: SnippetOptions = typeof opts === "string" ? { lang: opts, title: titleArg } : opts;
  const { lang = "ts", title = "", aspect = "wide", theme = "midnight", charsPerSecond = 25 } = o;
  const preset = ASPECTS.find((a) => a.key === aspect) ?? ASPECTS[0];
  const clips: Clip[] = [];
  if (title) {
    clips.push({ id: "title", type: "text", start: 0, duration: 2, track: 1, content: title });
  }
  const offset = title ? 2 : 0;
  clips.push({
    id: "code",
    type: "code",
    start: offset,
    duration: Math.min(MAX_DURATION - offset, Math.max(3, code.length / Math.max(1, charsPerSecond))),
    track: 0,
    content: code,
    lang,
  });
  return { id: "snippet", width: preset.width, height: preset.height, fps: 30, theme, clips };
}
