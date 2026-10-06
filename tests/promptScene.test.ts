import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSnippet } from "../lib/promptScene.ts";

test("parses a clean JSON reply", () => {
  const r = parseSnippet('{"title":"Debounce","lang":"ts","code":"const a = 1;"}');
  assert.deepEqual(r, { title: "Debounce", lang: "ts", code: "const a = 1;" });
});

test("tolerates fences and surrounding text", () => {
  const r = parseSnippet('Sure!\n```json\n{"title":"T","lang":"py","code":"print(1)"}\n```');
  assert.equal(r?.lang, "py");
  assert.equal(r?.code, "print(1)");
});

test("rejects replies without usable code", () => {
  assert.equal(parseSnippet("no json here"), null);
  assert.equal(parseSnippet('{"title":"x","code":"  "}'), null);
  assert.equal(parseSnippet("{broken"), null);
});

test("defaults missing fields", () => {
  const r = parseSnippet('{"code":"x"}');
  assert.equal(r?.title, "");
  assert.equal(r?.lang, "ts");
});
