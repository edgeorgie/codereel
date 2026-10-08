# Specification: codereel

A browser editor that turns code into short animated videos for 16:9, 9:16, 1:1 and 4:5.

## Baseline

This specification describes the behavior verified for the 0.1.0 baseline (2026-10-06) and is the source of truth from here on. Every change starts in this document and follows the workflow in `AGENTS.md`.

## Users

Developers who want to publish code snippets, diffs and devlogs as video without installing a video editor.

## Goals

- Produce a shareable MP4 from a snippet in under a minute.
- Run entirely in the browser: no upload, no server rendering.
- Keep compositions portable by using HyperFrames-style HTML.

## Non-goals

- A full multi-track timeline editor.
- Audio editing.
- Server-side rendering.

## Requirements

### FR-1 Scene model

Status: Verified.

- Given a composition, when its clips are queried at time t, then only clips active at t are returned ordered by track.
- Given invalid input (duplicate ids, non-positive duration, duration over 60 s), then validation reports each problem.

### FR-2 HyperFrames-style HTML serialization

Status: Verified.

- Given a composition, when serialized and parsed again, then clips, timing, size and theme are preserved and content is escaped.

### FR-3 Deterministic canvas renderer

Status: Verified.

- Given the same composition and time, then the same frame is drawn.
- Given a narrow format, then the code font shrinks so the longest line fits the panel.

### FR-4 Social formats

Status: Verified.

- Given a format of 16:9, 9:16, 1:1 or 4:5, then the stage shows that exact ratio and the export uses its pixel size.

### FR-5 MP4 export in the browser

Status: Verified.

- Given a valid composition in Chrome or Edge, when the user exports, then a downloadable file with a valid MP4 header is produced and progress is shown.

### FR-6 Snippet from a prompt (bring your own key)

Status: Implemented, not verified end to end.

- Given a description and a provider key, when the user generates, then title, language and code fill the editor.
- Given a malformed model reply, then an error is shown instead of corrupting the editor.
- Given a provider key, then it is kept in sessionStorage for the tab by default, kept on the device only when the user ticks "Remember on this device", and removable with "Clear key".

### FR-7 Import from GitHub

Status: Verified.

- Given a file link with a line range or a commit link to a public repo, when imported, then the editor shows those lines or the diff with added and removed lines colored.

### FR-8 Keyboard shortcuts respect focused controls

Status: Verified.

- Given a focused button, tab or field, when Space is pressed, then the control activates natively and playback is not toggled; Space toggles playback only when no control has focus.
- Given an import in progress, when Enter is pressed again in the link field, then no second request starts.

### FR-9 Narrow screens keep the format selector usable

Status: Verified.

- Given a 375 px viewport, then the four format buttons are fully legible and the Export button stays on one line.

### FR-10 Content Security Policy on the static export

Status: Verified.

- Given the Pages export, then every page carries a Content-Security-Policy meta tag that allows scripts only from the site and from the hashes of its inline scripts, and connections only to the site, api.anthropic.com, api.openai.com, api.github.com and raw.githubusercontent.com.

## Open risks

- Safari lacks full WebCodecs support, so export is disabled with a notice.
- Long compositions use more memory; the 60 second cap bounds it.
