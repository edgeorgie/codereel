"use client";

import { useState } from "react";
import { PROVIDERS, complete } from "@/lib/llm";
import type { Provider } from "@/lib/llm";
import { SCENE_SYSTEM_PROMPT, parseSnippet } from "@/lib/promptScene";
import type { SnippetResult } from "@/lib/promptScene";

const KEY_STORE = "codereel.llm";

function load(): { provider: Provider; key: string } {
  try {
    const raw = localStorage.getItem(KEY_STORE);
    if (raw) return JSON.parse(raw) as { provider: Provider; key: string };
  } catch {}
  return { provider: "anthropic", key: "" };
}

export default function AiPanel({ onResult }: { onResult: (r: SnippetResult) => void }) {
  const [settings, setSettings] = useState<{ provider: Provider; key: string }>({ provider: "anthropic", key: "" });
  const [loaded, setLoaded] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  if (!loaded && typeof window !== "undefined") {
    setLoaded(true);
    Promise.resolve().then(() => setSettings(load()));
  }

  const save = (next: { provider: Provider; key: string }) => {
    setSettings(next);
    try {
      localStorage.setItem(KEY_STORE, JSON.stringify(next));
    } catch {}
  };

  const generate = async () => {
    setError("");
    setBusy(true);
    try {
      const reply = await complete(settings.provider, settings.key, SCENE_SYSTEM_PROMPT, prompt);
      const result = parseSnippet(reply);
      if (!result) throw new Error("The model did not return a usable snippet. Try again.");
      onResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/10 to-blue-500/5 p-4 backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-violet-200">
          <span aria-hidden>✦</span> Write it for me
        </span>
        <button onClick={() => setOpen((o) => !o)} className="text-[11px] text-zinc-400 hover:text-zinc-200">
          {open ? "Hide key" : settings.key ? "API key set" : "Add API key"}
        </button>
      </div>
      {open && (
        <div className="mb-3 flex flex-col gap-2">
          <select
            value={settings.provider}
            onChange={(e) => save({ ...settings, provider: e.target.value as Provider })}
            className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs"
          >
            {Object.entries(PROVIDERS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <input
            type="password"
            value={settings.key}
            onChange={(e) => save({ ...settings, key: e.target.value })}
            placeholder="Your API key (stays in this browser)"
            className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs outline-none focus:border-violet-400/60"
          />
        </div>
      )}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        placeholder="e.g. a debounce hook in React"
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none transition focus:border-violet-400/60"
      />
      <button
        onClick={generate}
        disabled={busy || !prompt.trim() || !settings.key}
        className="mt-2 w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/15 disabled:opacity-50"
      >
        {busy ? "Writing..." : settings.key ? "Generate snippet" : "Add an API key to generate"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
