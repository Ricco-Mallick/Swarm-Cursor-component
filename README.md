<div align="center">

# cursor-swarm

**A crowd of multiplayer cursors builds your UI, live.**

One web component, zero dependencies, about 9 kB gzipped. Works with plain HTML, React, Next.js, Vue, Svelte and Astro.

[![npm](https://img.shields.io/npm/v/cursor-swarm?color=7C5CFF)](https://www.npmjs.com/package/cursor-swarm)
[![gzip size](https://img.shields.io/bundlejs/size/cursor-swarm?color=14B8A6)](https://bundlejs.com/?q=cursor-swarm)
[![license](https://img.shields.io/badge/license-MIT-FF4F8B)](LICENSE)
[![stars](https://img.shields.io/github/stars/Ricco-Mallick/Swarm-Cursor-component?style=social)](https://github.com/Ricco-Mallick/Swarm-Cursor-component)

[**Live demo & playground →**](https://ricco-mallick.github.io/Swarm-Cursor-component/)

![cursor-swarm building a landing page](https://raw.githubusercontent.com/Ricco-Mallick/Swarm-Cursor-component/main/media/demo.gif)

</div>

Wrap any section in `<cursor-swarm>`. When it scrolls into view, the cursors fly in and rebuild it in front of your visitors. They drag out boxes with live `W × H` badges, type headings and paragraphs line by line, and wipe images in. When they're done, they flock around your pointer and leave.

It reads your real DOM and CSS, so you don't need any config, extra markup or screenshots.

## Quick start

### HTML / CDN

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/cursor-swarm/dist/cursor-swarm.js"></script>

<cursor-swarm cursors="6">
  <section class="hero">
    <h1>Hello, world</h1>
    <p>Built live by a crowd of cursors.</p>
  </section>
</cursor-swarm>
```

> Tip: add `cursor-swarm:not(:defined) { visibility: hidden; }` to your CSS so content doesn't flash before the script loads.

### React / Next.js

```bash
npm i cursor-swarm
```

```jsx
import { CursorSwarm } from 'cursor-swarm/react';

export default function Hero() {
  return (
    <CursorSwarm cursors={6} speed={1.5} onComplete={() => console.log('built!')}>
      <section className="hero">
        <h1>Hello, world</h1>
      </section>
    </CursorSwarm>
  );
}
```

The wrapper is typed, marked `'use client'`, and safe to import during SSR. Its `ref` gives you the element, so you can call `ref.current.replay()`.

### Vue / Svelte / Astro

```js
import 'cursor-swarm'; // registers <cursor-swarm>
```

In Vue, tell the compiler it's a custom element: `isCustomElement: (tag) => tag === 'cursor-swarm'`.

## API

### Attributes

| Attribute | Default | Description |
| --- | --- | --- |
| `cursors` | `5` | How many cursors join in (1–24). |
| `speed` | `1` | Build speed multiplier. |
| `trigger` | `visible` | `visible` starts when scrolled into view, `load` starts immediately, `manual` waits for `play()`. |
| `scope` | `viewport` | `viewport` builds what's on screen as you scroll. `all` builds everything right away. |
| `linger` | `2500` | Milliseconds the cursors flock around the pointer before leaving. `0` leaves right away, `infinite` stays. |
| `sound` | off | Synthesized clicks and typing (Web Audio, no files). Starts after the first user interaction. |
| `volume` | `0.4` | Sound volume, 0–1. |
| `names` | `Ava,Kai,Mia,…` | Comma-separated cursor names. |
| `colors` | 8 colors | Comma-separated CSS colors. |
| `hide-labels` | off | Hide the name tags. |
| `ignore-reduced-motion` | off | Animate even when the user prefers reduced motion. |

Every attribute is also a JS property, e.g. `el.cursors = 8` or `el.sound = true`.

### Per-element hints

| Attribute | Effect |
| --- | --- |
| `data-swarm="text"` / `"box"` / `"block"` / `"media"` | Force how an element is built: typed, drawn as a container, drawn as one block, or wiped in. |
| `data-swarm="skip"` | Don't animate this element itself, but still animate its children. |
| `data-swarm-ignore` | Leave this element and everything inside it alone. It stays visible. |

### Methods and events

| | |
| --- | --- |
| `play()` | Start building. Use it with `trigger="manual"`. |
| `replay()` | Hide everything and build it again. |
| `finish()` | Skip to the end. |
| `reset()` | Reveal everything, remove the cursors and go back to idle. |
| `state` | `idle`, `armed`, `building`, `finale` or `done`. |
| `swarmstart` / `swarmcomplete` / `swarmend` | Fired when building starts, when the last element is built, and when the cursors have left. |

## How it works

1. **Scan.** It walks the light DOM inside the element and sorts things into kinds: **text** (headings, paragraphs, links), **media** (images, SVG, video, canvas), **blocks** (buttons, inputs, styled leaf boxes) and **boxes** (styled containers whose children get built after them).
2. **Hide.** Each element gets an inline `visibility: hidden`, so the layout never shifts.
3. **Build.** Each cursor takes the next ready task in reading order, preferring the nearest one so the swarm spreads out. A box drags open with `clip-path: inset()` following the cursor. Text is revealed line by line with a polygon clip and a caret. Media gets a placeholder and then a wipe. Children wait for their parent, and cursors speed up when you scroll faster than they can build.
4. **Restore.** Your inline styles are put back exactly as they were. Cursors live in a shadow-DOM overlay with `pointer-events: none`, so the page stays clickable the whole time.

If the user prefers reduced motion, content is shown immediately and nothing animates.

## Limitations

- It only animates the visible layout. Your page's own animations and scripts keep running underneath.
- Open shadow roots inside your content are revealed as one block (`media`), not typed.
- Very large pages are capped at 800 animated elements by default (`max-tasks` attribute).

## Development

```bash
npm install
npm run dev     # builds and serves the demo site at http://localhost:4173
npm test        # end-to-end tests in headless Chrome (set CHROME_PATH if needed)
```

## Credits

Inspired by [**Swarm**](https://califa.github.io/swarm-site/) by [Joel Califa](https://joelcalifa.com), a site that builds itself as you scroll, and by [Swarm Rebuild](https://github.com/DhvanilPatel/swarm-cursors) by Dhvanil Patel, which brought the idea to any page as a Chrome extension. Go check them out. cursor-swarm is an independent implementation written from scratch, so none of their code or assets are used.

## License

[MIT](LICENSE)
