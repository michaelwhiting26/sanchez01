# Sanchez prototype → Figma plugin

Rebuilds the HTML prototype (`prototype/`) as **editable Figma layers**: real frames, text, images, icons, borders, shadows and gradients, plus Figma colour styles from the design tokens. Works on a **free Figma plan**, because you run it as a *development plugin* from a local folder. No publishing, no paid seat.

## Install (once, 1 minute)

1. Open the **Figma desktop app** and open (or create) a design file. Use a **fresh file**: the free plan allows 3 pages per file, and the plugin puts every page on the current canvas, side by side.
2. Menu: **Plugins → Development → Import plugin from manifest…**
3. Choose `tools/figma-plugin/plugin/manifest.json` (a copy is also in Dropbox: `15. sanchezboxing/MW DESIGNS/figma-plugin/plugin/manifest.json`).

## Use

1. **Plugins → Development → Sanchez Prototype to Figma**
2. Click the drop zone, open the `data/` folder next to the manifest, select the page files you want (select all for everything), and click **Open**.
3. Leave "create colour styles" ticked the first time, then **Build in Figma**.
4. Wait for "Done". Each page appears as a frame named `index · desktop`, `product · mobile`, and so on. Fonts are Barlow and Barlow Condensed, which Figma includes.

Tip: build the five main pages first (index, product, configure, review, checkout, desktop and mobile). The other pages are near-empty stubs.

## What you get, and what you don't

| You get | Limits |
|---|---|
| Every visible box, text line and icon at its exact position and size | Layers are **absolutely positioned**, not Auto Layout. Move things freely, but resizing a frame won't reflow. |
| Fonts, sizes, weights, letter-spacing, colours, text transforms | Text is one layer per line/fragment of the browser's layout; long paragraphs are single wrapped layers. |
| Borders (per side), corner radii, drop shadows, backdrop blur, gradients | Inner shadows, CSS filters and blend modes are dropped. |
| Images (downscaled to 2× display size) and inline SVG icons | Background video becomes its poster image. |
| Sized background graphics such as the dropdown chevron | Tiled background patterns are dropped. |
| One Figma paint style per colour token (`Sanchez/palette/…`, `Sanchez/semantic/…`) and a swatch board | Text styles are not created (sizes use `clamp()`, which has no fixed value). |
| Desktop (1440) and mobile (390) for the five key pages | Only the page's resting state is captured (no hover, open drawers or other steps). Add states with `?state=…` URLs (see `prototype/README.md`) and extract those too. |

## Refresh after the prototype changes

```bash
cd ~/Code/sanchez-web
python3 -m http.server 8000 &                 # serve the prototype (needed for images)
cd tools/figma-plugin/extract
node extract.js                               # all pages   |  node extract.js index product   for a few
cp out/*.json ../plugin/data/                 # put the fresh page files where the plugin panel expects them
```

Requires Node and Google Chrome. `npm install` in `extract/` the first time (installs `puppeteer-core`; it uses your installed Chrome).

## Checks (no Figma needed)

- `node extract/preview.js index desktop` re-draws the extracted JSON as plain HTML next to a screenshot of the real page (`extract/out/*.original.png` and `*.rebuilt.png`) so you can see extraction fidelity.
- `node test/mock-figma.test.cjs extract/out/index.desktop.json` runs the plugin against a strict stand-in for the Figma API and reports crashes or API mistakes. It cannot prove the result *looks* right in Figma; only the real app can.

## Layout

```
tools/figma-plugin/
  extract/   extract.js (DOM → JSON), preview.js (QA render), package.json
  plugin/    manifest.json, code.js, ui.html, data/  ← import the manifest from here
  test/      mock-figma.test.cjs
```

The extractor reads only the prototype you serve locally. Nothing is uploaded anywhere.
