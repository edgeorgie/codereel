# ADR 0001: Render in the browser with WebCodecs

Status: accepted

## Context

Hyperframes renders with headless Chrome and FFmpeg, which cannot run on Vercel's serverless functions.

## Decision

Draw each frame on a canvas and encode with WebCodecs through mediabunny.

## Consequences

No server cost and no upload. Export is limited to browsers with WebCodecs (Chrome and Edge) and to 60 seconds.
