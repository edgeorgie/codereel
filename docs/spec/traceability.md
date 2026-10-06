# Traceability: codereel

Every requirement maps to implementation files and to tests or manual evidence. `npm run spec:check` enforces that each requirement has an implementation, that files exist, and that there is a test or a manual note.

| Requirement | Implementation | Tests | Evidence | Status |
|---|---|---|---|---|
| FR-1 | `lib/scene.ts` | `tests/scene.test.ts` | PR 1: tests for activeClips, typedText and validate. | Verified |
| FR-2 | `lib/html.ts` | `tests/scene.test.ts` | PR 1: round-trip test with special characters. | Verified |
| FR-3 | `lib/render.ts`, `lib/highlight.ts` | `tests/highlight.test.ts` | PR 2, PR 5, PR 9: drawn frames inspected in Chrome for all four formats. | Verified |
| FR-4 | `lib/scene.ts`, `components/Player.tsx`, `app/page.tsx` | `tests/highlight.test.ts` | PR 9: measured stage ratios 1.778, 0.563, 1.000 and 0.800 in Chrome. | Verified |
| FR-5 | `lib/export.ts`, `app/page.tsx` | manual | manual: PR 3 and PR 9, exported MP4 inspected for the ftyp box in Chrome (about 78 KB for the sample, around 1 s). | Verified |
| FR-6 | `lib/promptScene.ts`, `lib/llm.ts`, `components/AiPanel.tsx` | `tests/promptScene.test.ts` | PR 6: parser tests for fences, extra text and invalid JSON. Not run against a real provider. | Implemented, not verified end to end |
| FR-7 | `lib/github.ts`, `components/ImportPanel.tsx` | `tests/github.test.ts` | PR 7: verified against the real GitHub API in Chrome with a file range and a commit. | Verified |

"Verified" means the behavior was exercised. "Implemented, not verified end to end" means the code exists and its parts are tested, but a real external service or credential was not available.
