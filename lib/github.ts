export type GithubRef =
  | { kind: "blob"; owner: string; repo: string; ref: string; path: string; from?: number; to?: number }
  | { kind: "commit"; owner: string; repo: string; sha: string };

/** Parses GitHub file links (with optional #L10-L25 range) and commit links. Returns null for anything else. */
export function parseGithubUrl(input: string): GithubRef | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.hostname !== "github.com") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 4) return null;
  const [owner, repo, type] = parts;
  if (type === "commit" && /^[0-9a-f]{7,40}$/i.test(parts[3])) {
    return { kind: "commit", owner, repo, sha: parts[3] };
  }
  if (type === "blob" && parts.length >= 5) {
    const range = url.hash.match(/^#L(\d+)(?:-L(\d+))?$/);
    const from = range ? Number(range[1]) : undefined;
    const to = range ? Number(range[2] ?? range[1]) : undefined;
    return { kind: "blob", owner, repo, ref: parts[3], path: parts.slice(4).join("/"), from, to };
  }
  return null;
}

export function langFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "ts", tsx: "ts", js: "js", jsx: "js", mjs: "js", py: "py", go: "go", rs: "rust", sh: "sh", html: "html", css: "css",
  };
  return map[ext] ?? "ts";
}

export function sliceLines(text: string, from?: number, to?: number, max = 14): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const start = from ? from - 1 : 0;
  const end = to ?? start + max;
  return lines.slice(start, Math.min(end, start + max)).join("\n").replace(/\s+$/, "");
}

/** Keeps the first hunk lines of a diff, dropping file headers, so it fits a short video. */
export function trimDiff(diff: string, max = 16): string {
  const lines = diff.replace(/\r\n/g, "\n").split("\n");
  const firstHunk = lines.findIndex((l) => l.startsWith("@@"));
  const body = firstHunk === -1 ? lines : lines.slice(firstHunk);
  return body.slice(0, max).join("\n").replace(/\s+$/, "");
}

export interface ImportedSnippet {
  title: string;
  lang: string;
  code: string;
}

// Runs in the browser. Public repos only, so no token is needed (60 requests per hour per IP).
export async function importFromGithub(ref: GithubRef): Promise<ImportedSnippet> {
  if (ref.kind === "blob") {
    const res = await fetch(`https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${ref.ref}/${ref.path}`);
    if (!res.ok) throw new Error(`Could not fetch the file (${res.status}). Public repos only.`);
    const code = sliceLines(await res.text(), ref.from, ref.to);
    if (!code) throw new Error("The selected lines are empty.");
    return { title: ref.path.split("/").pop() ?? ref.path, lang: langFromPath(ref.path), code };
  }
  const api = `https://api.github.com/repos/${ref.owner}/${ref.repo}/commits/${ref.sha}`;
  const [diffRes, metaRes] = await Promise.all([
    fetch(api, { headers: { Accept: "application/vnd.github.diff" } }),
    fetch(api, { headers: { Accept: "application/vnd.github+json" } }),
  ]);
  if (!diffRes.ok) throw new Error(`Could not fetch the commit (${diffRes.status}). Public repos only.`);
  const meta = metaRes.ok ? ((await metaRes.json()) as { commit?: { message?: string } }) : {};
  const title = (meta.commit?.message ?? "").split("\n")[0].slice(0, 80) || `Commit ${ref.sha.slice(0, 7)}`;
  return { title, lang: "diff", code: trimDiff(await diffRes.text()) };
}
