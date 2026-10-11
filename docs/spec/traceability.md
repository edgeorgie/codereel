# Traceability: codereel

Every requirement maps to implementation files and to tests or manual evidence. `npm run spec:check` enforces that each requirement has an implementation, that files exist, and that there is a test or a manual note.

| Requirement | Implementation | Tests | Evidence | Status |
|---|---|---|---|---|
| FR-1 | `lib/scene.ts` | `tests/scene.test.ts` | PR 1: tests for activeClips, typedText and validate. | Verified |
| FR-2 | `lib/html.ts` | `tests/scene.test.ts` | PR 1: round-trip test with special characters. | Verified |
| FR-3 | `lib/render.ts`, `lib/highlight.ts` | `tests/highlight.test.ts` | PR 2, PR 5, PR 9: drawn frames inspected in Chrome for all four formats. | Verified |
| FR-4 | `lib/scene.ts`, `components/Player.tsx`, `app/page.tsx` | `tests/highlight.test.ts` | PR 9: measured stage ratios 1.778, 0.563, 1.000 and 0.800 in Chrome. | Verified |
| FR-5 | `lib/export.ts`, `app/page.tsx` | manual | manual: PR 3 and PR 9, exported MP4 inspected for the ftyp box in Chrome (about 78 KB for the sample, around 1 s). | Verified |
| FR-6 | `lib/promptScene.ts`, `lib/llm.ts`, `lib/keystore.ts`, `components/AiPanel.tsx` | `tests/promptScene.test.ts`, `tests/keystore.test.ts` | PR 6: parser tests for fences, extra text and invalid JSON. Not run against a real provider. | Implemented, not verified end to end |
| FR-7 | `lib/github.ts`, `components/ImportPanel.tsx` | `tests/github.test.ts` | PR 7: verified against the real GitHub API in Chrome with a file range and a commit. | Verified |
| FR-8 | `lib/keys.ts`, `components/Player.tsx`, `components/ImportPanel.tsx` | `tests/keys.test.ts` | In Chrome, Space on the focused Look tab opens it and playback keeps running (QA BUG-003). | Verified |
| FR-9 | `app/page.tsx` | manual | manual: in Chrome at 375 px the selector takes its own row (QA BUG-004). | Verified |
| FR-10 | `scripts/csp.mjs`, `scripts/deploy-pages.mjs` | `tests/csp.test.ts` | Hash and policy tests; published site checked in Chrome after deploy (SEC-001). The PostHog hosts added for FR-11 are covered by a unit test and by inspecting the generated meta tag with and without `NEXT_PUBLIC_POSTHOG_HOST`; not re-checked on the published site. | Verified |
| FR-11 | `lib/analytics.ts`, `components/Analytics.tsx`, `instrumentation-client.ts`, `app/page.tsx`, `app/layout.tsx`, `next.config.ts`, `scripts/csp.mjs`, `scripts/deploy-pages.mjs` | `tests/analytics.test.ts`, `tests/csp.test.ts` | In Chromium against local stand-ins for the PostHog endpoints, a build with a placeholder key sent `editor_opened`, `$pageview` and `video_exported` (all four formats) to same-origin `/ingest` with `app` and `surface`, no cookies and no storage. A build without a key made no analytics request, printed nothing to the console and has no PostHog code in `.next/static` or the Pages export (`grep -rli posthog` empty). The encoder was stubbed for the export check (the test browser has no H.264). Not run against a live PostHog project. | Implemented, not verified end to end |

"Verified" means the behavior was exercised. "Implemented, not verified end to end" means the code exists and its parts are tested, but a real external service or credential was not available.
