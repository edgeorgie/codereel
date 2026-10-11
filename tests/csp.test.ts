import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { addCsp, posthogOrigins } from "../scripts/csp.mjs";

const body = 'self.__next_f.push([1,"x"])';
const hash = `'sha256-${createHash("sha256").update(body).digest("base64")}'`;
const page = `<html><head><meta charSet="utf-8"/></head><body><script>${body}</script><script src="/a.js"></script></body></html>`;

test("inline scripts are allowed by hash and external ones only from self", () => {
  const out: string = addCsp(page, ["https://api.openai.com"]);
  assert.ok(out.includes(`script-src 'self' ${hash}`));
  assert.ok(out.includes("connect-src 'self' https://api.openai.com"));
  assert.ok(out.includes("object-src 'none'"));
  assert.ok(!out.includes("unsafe-eval"));
});

test("the policy is the first thing in head and is not duplicated on a second pass", () => {
  const once: string = addCsp(page);
  const twice: string = addCsp(once);
  assert.equal(once, twice);
  assert.ok(once.indexOf("Content-Security-Policy") < once.indexOf("charSet"));
});

test("PostHog origins are allowed only when a direct host is configured", () => {
  assert.deepEqual(posthogOrigins(undefined), { connect: [], script: [] });
  assert.deepEqual(posthogOrigins("https://us.i.posthog.com"), {
    connect: ["https://us.i.posthog.com", "https://us-assets.i.posthog.com"],
    script: ["https://us-assets.i.posthog.com"],
  });
  assert.deepEqual(posthogOrigins("https://ph.example.com"), { connect: ["https://ph.example.com"], script: ["https://ph.example.com"] });
  const direct = posthogOrigins("https://us.i.posthog.com");
  const out: string = addCsp(page, ["https://api.openai.com", ...direct.connect], direct.script);
  assert.ok(out.includes(`script-src 'self' ${hash} https://us-assets.i.posthog.com`));
  assert.ok(out.includes("connect-src 'self' https://api.openai.com https://us.i.posthog.com https://us-assets.i.posthog.com"));
  assert.ok(!addCsp(page).includes("posthog"));
});
