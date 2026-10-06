"use client";

import { useMemo, useState } from "react";
import { canExportMp4, exportMp4 } from "@/lib/export";
import Player from "@/components/Player";
import { snippetComposition, validate } from "@/lib/scene";

const SAMPLE = `export function add(a: number, b: number) {
  return a + b;
}

console.log(add(2, 3));`;

export default function Home() {
  const [code, setCode] = useState(SAMPLE);
  const [title, setTitle] = useState("Hello codereel");
  const comp = useMemo(() => snippetComposition(code, "ts", title), [code, title]);
  const errors = validate(comp);
  const [progress, setProgress] = useState<number | null>(null);
  const [exportError, setExportError] = useState("");

  const onExport = async () => {
    setExportError("");
    setProgress(0);
    try {
      const blob = await exportMp4(comp, setProgress);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "codereel.mp4";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setProgress(null);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold">codereel</h1>
        <p className="text-sm text-zinc-400">
          Paste code, preview the animated video, no install needed.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="flex flex-col gap-3">
          <label className="text-sm text-zinc-400" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
          />
          <label className="text-sm text-zinc-400" htmlFor="code">
            Code
          </label>
          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={14}
            spellCheck={false}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm"
          />
          <button
            onClick={onExport}
            disabled={errors.length > 0 || progress !== null}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
          >
            {progress === null ? "Export MP4" : `Exporting ${Math.round(progress * 100)}%`}
          </button>
          {exportError && <p className="text-sm text-red-400">{exportError}</p>}
          {!canExportMp4() && (
            <p className="text-xs text-zinc-500">MP4 export needs Chrome or Edge.</p>
          )}
          {errors.length > 0 && (
            <p className="text-sm text-red-400">{errors.join(", ")}</p>
          )}
        </section>
        <Player comp={comp} />
      </div>
    </main>
  );
}
