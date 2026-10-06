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
    <div className="fade-in flex flex-col gap-3">
      <p className="text-sm text-muted">Turn real code into a video. Paste a file link with a line range, or a commit to show its diff.</p>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && run()}
        placeholder="github.com/owner/repo/blob/main/file.ts#L10-L25"
        className="w-full rounded-lg border border-line bg-bg px-3 py-2 font-mono text-[13px] outline-none transition focus:border-lime"
      />
      <button onClick={run} disabled={busy || !url.trim()} className="rounded-lg bg-lime px-4 py-2.5 text-sm font-bold text-bg transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40">
        {busy ? "Importing..." : "Import"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
