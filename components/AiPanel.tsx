"use client";

import { useState } from "react";
import KeyNotes from "@/components/KeyNotes";
import { clearKeys, readKeys, writeKeys } from "@/lib/keystore";
import { PROVIDERS, complete } from "@/lib/llm";
import type { Provider } from "@/lib/llm";
import { SCENE_SYSTEM_PROMPT, parseSnippet } from "@/lib/promptScene";
import type { SnippetResult } from "@/lib/promptScene";

const SETTINGS = "codereel.llm";
const KEY = "codereel.llm.key";
const HOSTS: Record<Provider, string> = { anthropic: "api.anthropic.com", openai: "api.openai.com" };

interface Settings {
  provider: Provider;
  key: string;
  remember: boolean;
}

function load(): Settings {
  const settings: Settings = { provider: "anthropic", key: "", remember: false };
  try {
    const raw = localStorage.getItem(SETTINGS);
    if (raw) {
      const stored = JSON.parse(raw) as { provider?: Provider; key?: string };
      if (stored.provider) settings.provider = stored.provider;
      if (stored.key) {
        sessionStorage.setItem(KEY, JSON.stringify({ key: stored.key }));
        localStorage.setItem(SETTINGS, JSON.stringify({ provider: settings.provider }));
      }
    }
    const keys = readKeys<{ key: string }>(KEY, sessionStorage, localStorage);
    settings.key = keys.value?.key ?? "";
    settings.remember = keys.remember;
  } catch {}
  return settings;
}

function persist(next: Settings) {
  try {
    localStorage.setItem(SETTINGS, JSON.stringify({ provider: next.provider }));
    if (next.key) writeKeys(KEY, { key: next.key }, next.remember, sessionStorage, localStorage);
    else clearKeys(KEY, sessionStorage, localStorage);
  } catch {}
}

const field = "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none transition focus:border-lime";

export default function AiPanel({ onResult }: { onResult: (r: SnippetResult) => void }) {
  const [settings, setSettings] = useState<Settings>({ provider: "anthropic", key: "", remember: false });
  const [loaded, setLoaded] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!loaded && typeof window !== "undefined") {
    setLoaded(true);
    Promise.resolve().then(() => setSettings(load()));
  }

  const save = (next: Settings) => {
    setSettings(next);
    persist(next);
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
    <div className="fade-in flex flex-col gap-3">
      <p className="text-sm text-muted">Describe a snippet and it fills the title and the code for you.</p>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="e.g. a debounce hook in React" className={field} />
      <div className="flex gap-2">
        <select value={settings.provider} onChange={(e) => save({ ...settings, provider: e.target.value as Provider })} className={`${field} w-32`} aria-label="Provider">
          {Object.entries(PROVIDERS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <input type="password" value={settings.key} onChange={(e) => save({ ...settings, key: e.target.value })} placeholder="API key" className={field} />
      </div>
      <KeyNotes host={HOSTS[settings.provider]} remember={settings.remember} hasKey={Boolean(settings.key)} onRemember={(remember) => save({ ...settings, remember })} onClear={() => save({ ...settings, key: "" })} />
      <button
        onClick={generate}
        disabled={busy || !prompt.trim() || !settings.key}
        className="rounded-lg bg-lime px-4 py-2.5 text-sm font-bold text-bg transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
      >
        {busy ? "Writing..." : settings.key ? "Generate snippet" : "Add an API key to generate"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
