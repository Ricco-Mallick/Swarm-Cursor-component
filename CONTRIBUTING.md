# Contributing to cursor-swarm

Thanks for helping out! Bug reports, ideas, docs fixes and pull requests are all welcome.

## Getting started

```bash
git clone https://github.com/Ricco-Mallick/Swarm-Cursor-component.git
cd Swarm-Cursor-component
npm install
npm run dev     # builds and serves the demo site at http://localhost:4173
npm test        # end-to-end tests in headless Chrome (set CHROME_PATH if Chrome isn't found)
```

## Project layout

| Path | What it is |
| --- | --- |
| `src/cursor-swarm.js` | The web component: scanning, hiding/revealing, cursor engine, sound |
| `src/react.js` / `src/react.d.ts` | React wrapper published as `cursor-swarm/react` |
| `registry/cursor-swarm.tsx` | TSX wrapper shipped through the shadcn registry |
| `scripts/build.mjs` | Builds `dist/`, the demo site bundle and the shadcn registry JSON |
| `site/` | Demo and docs site, deployed to GitHub Pages |
| `test/` | Playwright smoke tests |

## Pull requests

1. Fork the repo and create a branch such as `feat/my-idea` or `fix/typing-glitch`.
2. Keep the component dependency-free and small. Check the gzip size with `gzip -c dist/cursor-swarm.js | wc -c`.
3. Run `npm test`, and try your change on the demo site in Chrome, Firefox and Safari if you can.
4. If you add or change an option, update the README API table, the site's API table and the types (`src/*.d.ts`, `registry/cursor-swarm.tsx`).
5. Open the PR with a short description and, for visual changes, a screenshot or GIF.

## Good first issues

Look for issues labelled [`good first issue`](https://github.com/Ricco-Mallick/Swarm-Cursor-component/labels/good%20first%20issue). Some ideas that are always welcome:

- New build effects (for example, a "paste" animation for images or a "select all" for lists)
- Framework examples (SvelteKit, Nuxt, Astro, Remix)
- Accessibility and performance improvements

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE) and that you'll follow the [Code of Conduct](CODE_OF_CONDUCT.md).
