import assert from "node:assert/strict";
import { test } from "node:test";
import { APP, analyticsEnabled, durationBucket, exportProperties, loadAnalytics, track } from "../lib/analytics.ts";
import { ASPECTS, snippetComposition } from "../lib/scene.ts";

const SECRET = "const token = process.env.SUPER_SECRET_KEY;";

test("without a key the facade is disabled, tracks nothing and never loads the SDK", async () => {
  assert.equal(process.env.NEXT_PUBLIC_POSTHOG_KEY, undefined);
  assert.equal(analyticsEnabled, false);
  assert.doesNotThrow(() => track("editor_opened"));
  assert.equal(await loadAnalytics(), null);
});

test("the app property is fixed", () => {
  assert.equal(APP, "codereel");
});

test("durations are bucketed with the shared boundaries", () => {
  assert.equal(durationBucket(0), "<5s");
  assert.equal(durationBucket(4.99), "<5s");
  assert.equal(durationBucket(5), "5-30s");
  assert.equal(durationBucket(29.9), "5-30s");
  assert.equal(durationBucket(30), "30-120s");
  assert.equal(durationBucket(60), "30-120s");
  assert.equal(durationBucket(120), "120s+");
});

test("video_exported carries only the aspect label, the duration bucket and the fps", () => {
  for (const preset of ASPECTS) {
    const comp = snippetComposition(SECRET, { title: "My secret project", aspect: preset.key, charsPerSecond: 25 });
    const props = exportProperties(comp, preset);
    assert.deepEqual(Object.keys(props).sort(), ["aspect", "duration_bucket", "fps"]);
    assert.equal(props.aspect, preset.label);
    assert.equal(props.fps, 30);
    // 2 s title card plus the 3 s minimum code clip.
    assert.equal(props.duration_bucket, "5-30s");
    assert.ok(!JSON.stringify(props).includes("secret"));
  }
});

test("the duration bucket follows the composition, not the code length", () => {
  const long = snippetComposition("x".repeat(2000), { title: "t", aspect: "wide", charsPerSecond: 25 });
  assert.equal(exportProperties(long, ASPECTS[0]).duration_bucket, "30-120s");
});
