# Design system

## Principles

- The canvas is the protagonist; controls recede.
- One accent color, no gradients or glass.
- Space plays and pauses.

## Typography

| Role | Typeface |
|---|---|
| Display | Unbounded |
| Text | Inter Tight |
| Code | JetBrains Mono |

Fonts are loaded with `next/font` and exposed as CSS variables in `app/layout.tsx`.

## Color tokens

Defined as CSS variables in `app/globals.css` and mapped into Tailwind's theme.

| Token | Value | Use |
|---|---|---|
| `bg` | `#0f0f10` | Page background |
| `panel` | `#171718` | Sidebar and dock |
| `raise` | `#202022` | Raised surfaces |
| `line` | `#2b2b2e` | Borders |
| `text` | `#ececec` | Primary text |
| `muted` | `#8b8b92` | Secondary text |
| `lime` | `#c6ff3d` | Single accent for focus and actions |

## Motion

- The stage morphs between aspect ratios over 620 ms.
- A sliding indicator marks the active format and tab.
- The scrubber marks the typing segment.

All animation respects `prefers-reduced-motion`.

## Components

| Component | Purpose |
|---|---|
| Player | Stage and playback dock |
| AiPanel | Prompt to snippet |
| ImportPanel | GitHub import |

## Rules

- Color carries meaning; it is never the only signal.
- Interactive elements have visible focus and accessible names.
- New tokens are added to `globals.css` and this document together.
