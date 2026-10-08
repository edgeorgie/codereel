# Plan: codereel

## Overview

Editor state produces a composition. The player and the exporter both call the same renderer with a time value. The exporter steps frame by frame and feeds a canvas source to the encoder.

## Modules

| Path | Responsibility |
|---|---|
| `lib/scene.ts` | Composition model, validation, presets |
| `lib/render.ts` | Canvas drawing for a given time |
| `lib/export.ts` | Frame loop and H.264 encoding via WebCodecs |
| `lib/html.ts` | HTML serialization and parsing |
| `lib/github.ts` | URL parsing and fetching snippets |
| `lib/promptScene.ts` | Prompt and tolerant reply parsing |
| `components/` | Player, panels |
| `app/page.tsx` | Studio layout and state |

## Decisions

- [ADR 0001: Render in the browser with WebCodecs](../adr/0001-render-in-the-browser-with-webcodecs.md)
- [ADR 0002: Canvas for output, deterministic by time](../adr/0002-canvas-for-output-deterministic-by-time.md)

## Quality gates

`npm run verify`: typecheck, lint, spec check, tests and production build.
