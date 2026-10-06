"use client";

import { useState } from "react";
import { importFromGithub, parseGithubUrl } from "@/lib/github";
import type { ImportedSnippet } from "@/lib/github";

export default function ImportPanel({ onResult }: { onResult: (r: ImportedSnippet) => void }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setError("");
    const ref = parseGithubUrl(url);
    if (!ref) {
      setError("Paste a GitHub file link (optionally with #L10-L25) or a commit link.");
      return;
    }
    setBusy(true);
    try {
      onResult(await importFromGithub(ref));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-400/25 bg-gradient-to-br from-blue-500/10 to-emerald-500/5 p-4 backdrop-blur">
      <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-blue-200">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.96 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.08-1.87 3.76-3.65 3.96.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
        Import from GitHub
      </span>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="File link with #L10-L25, or commit link"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none transition focus:border-blue-400/60"
        />
        <button
          onClick={run}
          disabled={busy || !url.trim()}
          className="rounded-xl bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/15 disabled:opacity-50"
        >
          {busy ? "..." : "Import"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
