import type { Clip, ClipType, Composition } from "./scene.ts";

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (ch) => ESC[ch]);
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

/** Serializes a composition to HyperFrames-style HTML: a stage with timed `.clip` elements. */
export function toHtml(comp: Composition): string {
  const clips = comp.clips
    .map((c) => {
      const lang = c.lang ? ` data-lang="${escapeHtml(c.lang)}"` : "";
      return `  <div class="clip" id="${escapeHtml(c.id)}" data-clip-type="${c.type}" data-start="${c.start}" data-duration="${c.duration}" data-track-index="${c.track}"${lang}>${escapeHtml(c.content)}</div>`;
    })
    .join("\n");
  return `<div id="stage" data-composition-id="${escapeHtml(comp.id)}" data-start="0" data-width="${comp.width}" data-height="${comp.height}" data-fps="${comp.fps}"${comp.theme ? ` data-theme="${escapeHtml(comp.theme)}"` : ""}>\n${clips}\n</div>`;
}

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? unescapeHtml(m[1]) : undefined;
}

/** Parses the HTML emitted by toHtml. Returns null if the stage element is missing. */
export function fromHtml(html: string): Composition | null {
  const stage = html.match(/<div id="stage"[^>]*>/);
  if (!stage) return null;
  const clips: Clip[] = [];
  const re = /<div class="clip"([^>]*)>([\s\S]*?)<\/div>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tag = m[1];
    clips.push({
      id: attr(tag, "id") ?? `clip-${clips.length}`,
      type: (attr(tag, "data-clip-type") ?? "text") as ClipType,
      start: Number(attr(tag, "data-start") ?? 0),
      duration: Number(attr(tag, "data-duration") ?? 1),
      track: Number(attr(tag, "data-track-index") ?? 0),
      content: unescapeHtml(m[2]),
      lang: attr(tag, "data-lang"),
    });
  }
  return {
    id: attr(stage[0], "data-composition-id") ?? "composition",
    width: Number(attr(stage[0], "data-width") ?? 1920),
    height: Number(attr(stage[0], "data-height") ?? 1080),
    fps: Number(attr(stage[0], "data-fps") ?? 30),
    theme: attr(stage[0], "data-theme"),
    clips,
  };
}
