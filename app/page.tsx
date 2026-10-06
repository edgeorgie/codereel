"use client";

import { useEffect, useMemo, useState } from "react";
import Player from "@/components/Player";
import { canExportMp4, exportMp4 } from "@/lib/export";
import { THEMES } from "@/lib/render";
import { ASPECTS, compositionDuration, snippetComposition, validate } from "@/lib/scene";

const SAMPLE = `// Ship it in one line
export async function deploy(app: string) {
  const build = await run("npm run build");
  if (!build.ok) throw new Error("Build failed");
  return publish(app, { env: "production", retries: 3 });
}`;

const card = "rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur";
const label = "mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400";

export default function Home() {
  const [code, setCode] = useState(SAMPLE);
  const [title, setTitle] = useState("Deploy in one line");
  const [aspect, setAspect] = useState("wide");
  const [theme, setTheme] = useState("midnight");
  const [speed, setSpeed] = useState(25);
  const [progress, setProgress] = useState<number | null>(null);
  const [exportError, setExportError] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => setSupported(canExportMp4()));
  }, []);

  const comp = useMemo(
    () => snippetComposition(code, { lang: "ts", title, aspect, theme, charsPerSecond: speed }),
    [code, title, aspect, theme, speed],
  );
  const errors = validate(comp);
  const preset = ASPECTS.find((a) => a.key === aspect) ?? ASPECTS[0];

  const onExport = async () => {
    setExportError("");
    setProgress(0);
    try {
      const blob = await exportMp4(comp, setProgress);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `codereel-${preset.label.replace(":", "x")}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07080d] text-zinc-100">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-40 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[120px]" />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 font-mono text-lg font-bold shadow-lg shadow-violet-500/30">
              {"</>"}
            </div>
            <h1 className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              codereel
            </h1>
          </div>
          <p className="max-w-xl text-sm text-zinc-400">
            Paste code, pick a format and a look, export a video. Everything runs in your browser.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="flex flex-col gap-4">
            <div className={card}>
              <span className={label}>Format</span>
              <div className="grid grid-cols-2 gap-2">
                {ASPECTS.map((a) => (
                  <button
                    key={a.key}
                    onClick={() => setAspect(a.key)}
                    className={`group flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                      aspect === a.key
                        ? "border-violet-400/60 bg-violet-500/15 shadow-lg shadow-violet-500/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25"
                    }`}
                  >
                    <span
                      className="block rounded-[3px] border border-white/40 bg-white/10"
                      style={{
                        width: a.width >= a.height ? 22 : (22 * a.width) / a.height,
                        height: a.height >= a.width ? 22 : (22 * a.height) / a.width,
                      }}
                    />
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold">{a.label}</span>
                      <span className="text-[10px] leading-tight text-zinc-400">{a.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={card}>
              <span className={label}>Look</span>
              <div className="grid grid-cols-4 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    aria-label={t.label}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition ${
                      theme === t.key ? "border-violet-400/60 bg-violet-500/10" : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <span
                      className="h-8 w-full rounded-lg ring-1 ring-white/20"
                      style={{ background: `linear-gradient(135deg, ${t.bgFrom}, ${t.accent})` }}
                    />
                    <span className="text-[11px] text-zinc-300">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={card}>
              <label className={label} htmlFor="title">Title</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none transition focus:border-violet-400/60"
              />
              <label className={label} htmlFor="code">Code</label>
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={9}
                spellCheck={false}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-[13px] leading-relaxed outline-none transition focus:border-violet-400/60"
              />
              <label className={`${label} mt-4 flex justify-between`} htmlFor="speed">
                <span>Typing speed</span>
                <span className="font-mono normal-case text-zinc-300">{speed} chars/s</span>
              </label>
              <input
                id="speed"
                type="range"
                min={8}
                max={80}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-violet-400"
              />
            </div>

            <button
              onClick={onExport}
              disabled={errors.length > 0 || progress !== null || !supported}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3.5 text-sm font-semibold shadow-xl shadow-violet-500/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
            >
              {progress !== null && (
                <span className="absolute inset-y-0 left-0 bg-white/25 transition-all" style={{ width: `${progress * 100}%` }} />
              )}
              <span className="relative">
                {progress === null
                  ? `Export MP4  ·  ${preset.label}  ·  ${compositionDuration(comp).toFixed(0)}s`
                  : `Exporting ${Math.round(progress * 100)}%`}
              </span>
            </button>
            {exportError && <p className="text-sm text-red-400">{exportError}</p>}
            {!supported && <p className="text-xs text-zinc-500">MP4 export needs Chrome or Edge.</p>}
            {errors.length > 0 && <p className="text-sm text-red-400">{errors.join(", ")}</p>}
          </section>

          <Player key={`${aspect}`} comp={comp} />
        </div>
      </main>
    </div>
  );
}
