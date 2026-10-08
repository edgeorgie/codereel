# codereel: plan

Web editor for code and devlog videos. Nothing to install. Rendering happens in the browser.

## Scope
- Templates: animated code snippet (typing, line highlighting, diff), changelog, repo card.
- Composition as HTML with data attributes, compatible with the Hyperframes format.
- Live preview, a simple editing panel, MP4 export with WebCodecs.
- Out of scope: full timeline, advanced audio, server-side rendering.

## Deliverables
1. Week 2: scene model, player with a deterministic clock, snippet template, MP4 export in Chrome/Edge.
2. Week 3: editing panel (text, theme, duration, scene order), diff and changelog templates.
3. Week 4: scene from a prompt (BYOK), import from a GitHub commit or PR, README and deploy.

## Risks
- Safari has partial WebCodecs support: warn and degrade.
- Rendering DOM to frames: prefer canvas 2D for export; the preview may use the DOM.
- Memory on long videos: limit to 60 s in the MVP.

## Branches
GitFlow: feature/scene-model, feature/player, feature/export-mp4 from develop.
