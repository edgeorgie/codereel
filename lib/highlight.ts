export type TokenKind = "plain" | "comment" | "string" | "number" | "keyword" | "function" | "add" | "del";

export interface Token {
  text: string;
  kind: TokenKind;
}

const KEYWORDS =
  "const|let|var|function|return|if|else|for|while|import|from|export|default|class|new|async|await|type|interface|extends|true|false|null|undefined|def|self|print|in|of|try|catch|throw";

const RE = new RegExp(
  [
    "(\\/\\/.*$|#.*$)",
    "(\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'|`(?:[^`\\\\]|\\\\.)*`)",
    "(\\b\\d+(?:\\.\\d+)?\\b)",
    `(\\b(?:${KEYWORDS})\\b)`,
    "([A-Za-z_$][\\w$]*)(?=\\()",
  ].join("|"),
  "g",
);

const KINDS: TokenKind[] = ["comment", "string", "number", "keyword", "function"];

/** Splits one line of code into colored tokens. Covers JS, TS and Python well enough for short snippets. */
export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const m of line.matchAll(RE)) {
    const index = m.index ?? 0;
    if (index > last) tokens.push({ text: line.slice(last, index), kind: "plain" });
    const group = m.findIndex((g, i) => i > 0 && g !== undefined);
    tokens.push({ text: m[0], kind: KINDS[group - 1] });
    last = index + m[0].length;
  }
  if (last < line.length) tokens.push({ text: line.slice(last), kind: "plain" });
  return tokens;
}

/** Tokens for one line: diff lines are colored by their first character, everything else is highlighted as code. */
export function lineTokens(line: string, lang?: string): Token[] {
  if (lang === "diff") {
    if (line.startsWith("+") && !line.startsWith("+++")) return [{ text: line, kind: "add" }];
    if (line.startsWith("-") && !line.startsWith("---")) return [{ text: line, kind: "del" }];
    if (line.startsWith("@@")) return [{ text: line, kind: "comment" }];
    return [{ text: line, kind: "plain" }];
  }
  return tokenizeLine(line);
}
