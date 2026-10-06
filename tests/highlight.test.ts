import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenizeLine } from "../lib/highlight.ts";
import { ASPECTS, snippetComposition } from "../lib/scene.ts";

test("tokenizer classifies keywords, strings, numbers, functions and comments", () => {
  const kinds = tokenizeLine('const x = run("a", 3); // done').map((t) => `${t.kind}:${t.text}`);
  assert.ok(kinds.includes("keyword:const"));
  assert.ok(kinds.includes("function:run"));
  assert.ok(kinds.includes('string:"a"'));
  assert.ok(kinds.includes("number:3"));
  assert.ok(kinds.includes("comment:// done"));
});

test("tokens reassemble the original line", () => {
  const line = "if (a > 10) return `x ${a}`;";
  assert.equal(tokenizeLine(line).map((t) => t.text).join(""), line);
});

test("aspect presets set the composition size", () => {
  for (const a of ASPECTS) {
    const c = snippetComposition("x", { aspect: a.key });
    assert.equal(c.width, a.width);
    assert.equal(c.height, a.height);
  }
  assert.equal(snippetComposition("x", { aspect: "vertical" }).height, 1920);
});
