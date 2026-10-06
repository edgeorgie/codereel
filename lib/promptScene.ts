export interface SnippetResult {
  title: string;
  lang: string;
  code: string;
}

export const SCENE_SYSTEM_PROMPT = `You write short code snippets for developer videos.
Reply with ONLY a JSON object, no prose and no markdown fences:
{"title": "<short catchy title, max 8 words>", "lang": "<ts|js|py|go|rust|sh|html|css>", "code": "<the snippet, 6 to 14 lines, readable, with at most one short comment>"}
The snippet must be correct, self-contained and visually clean (lines under 60 characters).`;

/** Extracts and validates the JSON object from a model reply, tolerating code fences and extra text. */
export function parseSnippet(reply: string): SnippetResult | null {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const data = JSON.parse(reply.slice(start, end + 1)) as Partial<SnippetResult>;
    if (typeof data.code !== "string" || !data.code.trim()) return null;
    return {
      title: typeof data.title === "string" ? data.title.slice(0, 80) : "",
      lang: typeof data.lang === "string" ? data.lang.slice(0, 12) : "ts",
      code: data.code.replace(/\r\n/g, "\n").slice(0, 2000),
    };
  } catch {
    return null;
  }
}
