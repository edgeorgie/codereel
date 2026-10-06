"use client";

import { useEffect, useMemo, useState } from "react";
import AiPanel from "@/components/AiPanel";
import ImportPanel from "@/components/ImportPanel";
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

const TABS = ["Content", "Look", "Import", "AI"] as const;
type Tab = (typeof TABS)[number];

const field = "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none transition focus:border-lime";
const label = "mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted";

export default function Home() {
  const [code, setCode] = useState(SAMPLE);
  const [title, setTitle] = useState("Deploy in one line");
  const [lang, setLang] = useState("ts");
  const [aspect, setAspect] = useState("wide");
  const [theme, setTheme] = useState("midnight");
  const [speed, setSpeed] = useState(25);
  const [tab, setTab] = useState<Tab>("Content");
  const [progress, setProgress] = useState<number | null>(null);
  const [exportError, setExportError] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => setSupported(canExportMp4()));
  }, []);

  const comp = useMemo(() => snippetComposition(code, { lang, title, aspect, theme, charsPerSecond: speed }), [code, lang, title, aspect, theme, speed]);
  const errors = validate(comp);
  const preset = ASPECTS.find((a) => a.key === aspect) ?? ASPECTS[0];
  const aspectIndex = Math.max(0, ASPECTS.findIndex((a) => a.key === aspect));
  const tabIndex = TABS.indexOf(tab);

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
    <div className="flex h-screen min-h-[640px] flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <h1 className="wordmark flex items-center gap-2 text-lg">
          <span className="tick h-2.5 w-2.5 rounded-full bg-lime" />
          codereel
        </h1>

        <div className="relative grid grid-cols-4 rounded-full bg-panel p-1 ring-1 ring-line" role="tablist" aria-label="Video format">
          <span
            className="absolute inset-y-1 left-1 rounded-full bg-lime transition-transform duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
            style={{ width: "calc((100% - 0.5rem) / 4)", transform: `translateX(${aspectIndex * 100}%)` }}
          />
          {ASPECTS.map((a) => (
            <button
              key={a.key}
              role="tab"
              aria-selected={aspect === a.key}
              onClick={() => setAspect(a.key)}
              title={a.hint}
              className={`relative z-10 px-3 py-1.5 font-mono text-xs font-semibold transition-colors sm:px-5 ${aspect === a.key ? "text-bg" : "text-muted hover:text-text"}`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <button
          onClick={onExport}
          disabled={errors.length > 0 || progress !== null || !supported}
          className="relative overflow-hidden rounded-full bg-text px-5 py-2.5 text-sm font-bold text-bg transition hover:bg-lime active:scale-95 disabled:opacity-60"
        >
          {progress !== null && <span className="absolute inset-y-0 left-0 bg-lime transition-all" style={{ width: `${progress * 100}%` }} />}
          <span className="relative">{progress === null ? `Export  ${compositionDuration(comp).toFixed(0)}s` : `${Math.round(progress * 100)}%`}</span>
        </button>
      </header>

      <div role="main" className="grid min-h-0 flex-1 lg:grid-cols-[1fr_380px]">
        <section className="h-[64vh] min-h-[440px] min-w-0 lg:h-auto">
          <Player comp={comp} />
        </section>

        <aside className="flex min-h-0 flex-col border-t border-line bg-panel lg:border-l lg:border-t-0">
          <div className="relative grid grid-cols-4 border-b border-line">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`py-3.5 text-[13px] font-semibold transition-colors ${tab === t ? "text-text" : "text-muted hover:text-text"}`}>
                {t}
              </button>
            ))}
            <span className="absolute bottom-0 left-0 h-0.5 w-1/4 bg-lime transition-transform duration-300" style={{ transform: `translateX(${tabIndex * 100}%)` }} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {tab === "Content" && (
              <div key="content" className="fade-in flex flex-col gap-5">
                <div>
                  <label className={label} htmlFor="title">Title</label>
                  <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
                </div>
                <div>
                  <label className={label} htmlFor="code">Code</label>
                  <textarea id="code" value={code} onChange={(e) => setCode(e.target.value)} rows={11} spellCheck={false} className={`${field} font-mono text-[13px] leading-relaxed`} />
                </div>
                <div>
                  <label className={`${label} flex justify-between`} htmlFor="speed">
                    <span>Typing speed</span>
                    <span className="font-mono normal-case text-text">{speed} chars/s</span>
                  </label>
                  <input id="speed" type="range" min={8} max={80} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-lime" />
                </div>
              </div>
            )}

            {tab === "Look" && (
              <div key="look" className="fade-in grid grid-cols-2 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    className={`group overflow-hidden rounded-xl text-left ring-1 transition hover:-translate-y-0.5 ${theme === t.key ? "ring-2 ring-lime" : "ring-line"}`}
                    aria-label={t.label}
                  >
                    <span className="block h-20 p-3" style={{ background: `linear-gradient(135deg, ${t.bgFrom}, ${t.bgTo})` }}>
                      <span className="flex gap-1.5">
                        {[t.tokens.keyword, t.tokens.function, t.tokens.string, t.tokens.number].map((c, i) => (
                          <span key={i} className="h-2 w-5 rounded-full" style={{ background: c }} />
                        ))}
                      </span>
                      <span className="mt-2 block h-1.5 w-14 rounded-full" style={{ background: t.tokens.comment }} />
                      <span className="mt-1.5 block h-1.5 w-9 rounded-full" style={{ background: t.text, opacity: 0.7 }} />
                    </span>
                    <span className="block bg-raise px-3 py-2 text-xs font-semibold">{t.label}</span>
                  </button>
                ))}
              </div>
            )}

            {tab === "Import" && <ImportPanel key="import" onResult={(r) => { setTitle(r.title); setCode(r.code); setLang(r.lang); setTab("Content"); }} />}
            {tab === "AI" && <AiPanel key="ai" onResult={(r) => { setTitle(r.title); setCode(r.code); setLang(r.lang); setTab("Content"); }} />}

            {exportError && <p className="mt-4 text-sm text-red-400">{exportError}</p>}
            {!supported && <p className="mt-4 text-xs text-muted">MP4 export needs Chrome or Edge.</p>}
            {errors.length > 0 && <p className="mt-4 text-sm text-red-400">{errors.join(", ")}</p>}
          </div>

          <p className="border-t border-line px-5 py-3 font-mono text-[11px] text-muted">
            {preset.label} &middot; {preset.hint} &middot; space plays and pauses
          </p>
        </aside>
      </div>
    </div>
  );
}
