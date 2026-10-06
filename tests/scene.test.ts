import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeClips,
  compositionDuration,
  snippetComposition,
  typedText,
  validate,
} from "../lib/scene.ts";
import { fromHtml, toHtml } from "../lib/html.ts";

test("snippet composition has title and code clips", () => {
  const c = snippetComposition("const a = 1;", "ts", "Hello");
  assert.equal(c.clips.length, 2);
  assert.equal(validate(c).length, 0);
  assert.ok(compositionDuration(c) >= 5);
});

test("activeClips respects time range and track order", () => {
  const c = snippetComposition("x", "ts", "T");
  assert.deepEqual(activeClips(c, 1).map((x) => x.id), ["title"]);
  assert.deepEqual(activeClips(c, 3).map((x) => x.id), ["code"]);
});

test("typedText reveals content progressively", () => {
  const c = snippetComposition("abcdefghij", "ts");
  const clip = c.clips[0];
  assert.equal(typedText(clip, clip.start), "");
  assert.equal(typedText(clip, clip.start + clip.duration), "abcdefghij");
});

test("validate catches bad input", () => {
  const c = snippetComposition("x");
  c.clips.push({ ...c.clips[0] });
  c.clips[0].duration = 0;
  const errors = validate(c);
  assert.ok(errors.some((e) => e.includes("duplicate")));
  assert.ok(errors.some((e) => e.includes("duration must be > 0")));
});

test("html round trip keeps clips and escapes content", () => {
  const c = snippetComposition('<a href="x">&</a>', "html", "T");
  const back = fromHtml(toHtml(c));
  assert.ok(back);
  assert.equal(back.clips[1].content, '<a href="x">&</a>');
  assert.equal(back.width, 1920);
  assert.equal(back.clips.length, c.clips.length);
});
