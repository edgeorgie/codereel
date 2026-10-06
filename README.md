# codereel

Turn code into short animated videos from the browser. Paste a snippet, preview it, export an MP4. Nothing to install and no server-side rendering.

## Features

- Formats for every platform: 16:9, 9:16 (Reels, TikTok, Shorts), 1:1 and 4:5
- Four themes, syntax highlighting and adjustable typing speed
- Animated code snippet with a typing effect and a title card
- Generate a snippet from a short description with your own API key (Anthropic or OpenAI), called from the browser and never stored on a server
- Import a snippet from a GitHub file link (with line range) or a commit diff, public repos only
- Live preview with play, pause and a scrubber
- MP4 export in the browser (H.264 via WebCodecs), up to 60 seconds
- Compositions use HyperFrames-style HTML (a stage with timed `.clip` elements), so they stay portable

## Browser support

Export needs WebCodecs: Chrome or Edge. Preview works in any modern browser.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm test` runs the scene model and HTML serialization tests
- `npm run build` creates a production build

## Roadmap

1. Scene model, player and MP4 export (done)
2. Editing panel: theme, duration, scene order, diff and changelog templates
3. Scene from a prompt (bring your own key) and import from a GitHub commit or PR

## License

MIT
