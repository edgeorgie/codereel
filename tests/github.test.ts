import { test } from "node:test";
import assert from "node:assert/strict";
import { langFromPath, parseGithubUrl, sliceLines, trimDiff } from "../lib/github.ts";
import { lineTokens } from "../lib/highlight.ts";

test("parses blob links with and without line ranges", () => {
  const a = parseGithubUrl("https://github.com/vercel/next.js/blob/canary/packages/next/src/a.ts#L10-L25");
  assert.deepEqual(a, { kind: "blob", owner: "vercel", repo: "next.js", ref: "canary", path: "packages/next/src/a.ts", from: 10, to: 25 });
  const b = parseGithubUrl("https://github.com/o/r/blob/main/x.py");
  assert.ok(b && b.kind === "blob" && b.from === undefined);
});

test("parses commit links and rejects others", () => {
  assert.deepEqual(parseGithubUrl("https://github.com/o/r/commit/abc1234"), { kind: "commit", owner: "o", repo: "r", sha: "abc1234" });
  assert.equal(parseGithubUrl("https://gitlab.com/o/r/blob/main/x.ts"), null);
  assert.equal(parseGithubUrl("not a url"), null);
  assert.equal(parseGithubUrl("https://github.com/o/r"), null);
});

test("sliceLines honors ranges and the line cap", () => {
  const text = Array.from({ length: 40 }, (_, i) => `l${i + 1}`).join("\n");
  assert.equal(sliceLines(text, 3, 5), "l3\nl4\nl5");
  assert.equal(sliceLines(text, 1, 40).split("\n").length, 14);
});

test("trimDiff drops headers and caps length", () => {
  const diff = "diff --git a/x b/x\nindex 1..2\n--- a/x\n+++ b/x\n@@ -1 +1 @@\n-old\n+new";
  assert.equal(trimDiff(diff), "@@ -1 +1 @@\n-old\n+new");
});

test("language and diff coloring", () => {
  assert.equal(langFromPath("src/a.tsx"), "ts");
  assert.equal(lineTokens("+added", "diff")[0].kind, "add");
  assert.equal(lineTokens("-gone", "diff")[0].kind, "del");
  assert.equal(lineTokens("@@ -1 +1 @@", "diff")[0].kind, "comment");
});
