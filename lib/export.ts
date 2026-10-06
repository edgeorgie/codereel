import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, QUALITY_HIGH } from "mediabunny";
import { drawFrame } from "./render";
import { compositionDuration, frameCount } from "./scene";
import type { Composition } from "./scene";

export function canExportMp4(): boolean {
  return typeof VideoEncoder !== "undefined" && typeof OffscreenCanvas !== "undefined";
}

/**
 * Renders every frame deterministically (frame index to time) and encodes an H.264 MP4 in the browser.
 * Calls onProgress with a value between 0 and 1. Returns the MP4 bytes.
 */
export async function exportMp4(
  comp: Composition,
  onProgress?: (p: number) => void,
  signal?: AbortSignal,
): Promise<Blob> {
  if (!canExportMp4()) throw new Error("This browser does not support WebCodecs. Use Chrome or Edge.");
  const canvas = new OffscreenCanvas(comp.width, comp.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");

  const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
  const source = new CanvasSource(canvas, { codec: "avc", bitrate: QUALITY_HIGH });
  output.addVideoTrack(source, { frameRate: comp.fps });
  await output.start();

  const total = frameCount(comp);
  const end = compositionDuration(comp);
  for (let i = 0; i < total; i++) {
    if (signal?.aborted) {
      await output.cancel();
      throw new DOMException("Export cancelled", "AbortError");
    }
    const t = Math.min(i / comp.fps, end);
    drawFrame(ctx as unknown as CanvasRenderingContext2D, comp, t);
    await source.add(i / comp.fps, 1 / comp.fps);
    if (i % 5 === 0) onProgress?.(i / total);
  }
  await output.finalize();
  onProgress?.(1);
  const buffer = (output.target as BufferTarget).buffer;
  if (!buffer) throw new Error("Encoding produced no data");
  return new Blob([buffer], { type: "video/mp4" });
}
