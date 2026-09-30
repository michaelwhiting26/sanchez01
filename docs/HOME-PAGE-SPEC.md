# Sanchez Custom Boxing: home page specification

Version 1.0 · 30 Sep 2026 · Source of truth for the HTML prototype at `prototype/index.html`. Written so it can be handed to another engineer or a production build (`apps/web`) without the prototype open.

**Status:** prototype (vanilla JS, no build step). Served over http (canvas and WebGL reads are blocked on `file://`). Live at `michaelwhiting26.github.io/sanchez01/prototype/`. Repo: `michaelwhiting26/sanchez01`.

**Evidence rule (unchanged from the master brief):** no invented reviews, stats, prices, specs, clients or legal claims. Origin wording is always "Designed in Sydney. Handmade in Pattaya." Client names are PLACEHOLDER until written consent exists.

---

## 1. What the home page is

A single long, dark, motion-led page that sells one idea: **a maker's identity, stitched by hand.** It is not a conventional storefront home. The visual language is *running stitch* (dashes with gaps and the odd missing stitch), a *fingerprint* (rings that flow from the word SANCHEZ down the whole page), tan and black, with one saturated event: the word is spray-painted in the visitor's flag.

Top to bottom, every block sits on one continuous field of stitched dots that scrolls with the page.

| # | Block | File(s) | Purpose |
|---|---|---|---|
| 0 | Header | `app.js` (chrome) | Nav, cart, currency, "Build yours". |
| 1 | **Hero** | `hero-rings.js`, `hero-cursor.js`, `globe-hero.css` | Brand word + signature. Spray-painted flag, cloud intro, wave sets, ridge field. |
| 2 | **Curved loop** | `curved-loop.js` | SANCHEZ ✦ CUSTOM ✦ on an arc; drag to push. Luxury red star sprites. |
| 3 | **Workshop gallery** | `assets/carousel/lgc.bundle.js`, `lgc-scroll.js`, `lgc-note.js`, `lgc-ruler.js` | Pinned horizontal gallery driven by page scroll (6 slides). |
| 4 | **Marquee** | `marquee.js` | Huge SANCHEZ line; speed follows scroll velocity. |
| 5 | **Bag** | `bag-punch.js` (three.js + anime.js) | Live 3D heavy bag, Tiger and Monogram only. Drag to spin, click to punch. |
| 6 | **Feature cards** (3) | `depth-card.js`, `pixel-field.js` | Tiger / The workshop / Your bag. Stitched-thread overlay on interaction only. |
| 7 | **Rise panel** | `rise-panel.js`, `assets/brand/rise-card.svg` | The footer. Rises over the pinned page as a raised layer. Contains: logo, "Build your identity" CTA, **Waitlist**, minimal footer. |
| — | Background | `dna-core.js` | Fixed double-helix behind the page. Hidden over the gallery; narrows into the bag's chain. |

Pages that are *not* on the home page but are linked: `work-in-progress.html` holds the parked **Flare carousel** (`flare-carousel.js`).

---

## 2. Global visual system

**Palette.** Background `#050403` to `#161311`. Tan `#D6B588` (pattern, outline). Cream `#F3EADC` (type). Rust `#C4553A` (accent, CTA `--color-accent`). Gold `#C9A45C` (fine details). Flag: navy (lifted) `#1A42B0`, red `#E4002B`, white `#FAFAFA`.

**Type.** Barlow Condensed (display), Barlow (text), Mona Sans (rolling CTA only, SIL OFL, `assets/fonts/MonaSans-Variable.woff2`), Inter for WebGL card text.

**Motion principles.** Everything derives from a small number of continuous variables (scroll position, time), never independent timelines. One flow direction per section. Restraint: the centre is calm, the edges move. Reduced motion always disables continuous motion (see §9).

**The field.** One fixed 2D canvas (`canvas.wm-field`, inserted as the first child of `<body>`, `z-index` behind every section) draws the entire stitched dot pattern for the whole page. Sections above it are transparent where the field must show through. Ends where the last transparent section ends (`fieldEnd`).

---

## 3. Hero (the centrepiece)

Owned by `hero-rings.js` (340 lines, vanilla canvas 2D). Everything below is one draw function per frame.

### 3.1 Data
- **Map** `assets/globe/rings-map-{land|port}.png` (RGB): R = distance from the word, G = the outline, B = the letter interiors. Landscape or portrait chosen by viewport.
- **Grid**: one cell per map pixel, tiled down the whole page. Rows above/below the map continue outward by distance, so the pattern never ends.
- **Ridge distance** `ddw` and angle `thv` per cell (a wobbled fingerprint: rings round the word).
- **Flag map** `assets/flag/flag-3840.png` (official Australian flag, 3840×1920, from Wikimedia Commons, public-domain artwork) down-sampled to 480×240 and quantised to 3 palette indices at load. The vector `assets/flag/flag.svg` is kept.

### 3.2 Layers (draw order, one pass per colour bucket)
1. **Ridges**: dots on rings around the word. Running stitch: dash 8 cells, gap 3, ~7% of stitches missing (0% at the crest of a wave). Soft anti-aliased edges (coverage-based brightness, no on/off). Some rings carry much longer dashes; ridge thickness swells by up to ~2 units where the flow noise swells.
2. **Outline**: pure tan `#D6B588`, every dot.
3. **Paint** inside the letters (see 3.3).
4. **Second coat**: the outline is sprayed once more (flag colour, tan showing through where thin) and a fine overspray halo sits just outside it (≈10 cells), trailing the first coat by 34 cells.
5. **Clouds** (see 3.4): visible only during the first spray pass.
6. **Overspray mist** (see 3.3).
7. Interaction forces (cursor push, click ripple), applied per dot with easing.

### 3.3 Spray paint (the flag)
- **First pass**: on load, after a 700 ms beat, a front sweeps the word from the **top-left of the S to the bottom-right of the Z** over **5.2 s** (front slope 0.35; smoothstep/linear blend easing). Each dot has a ragged edge (per-dot jitter ±3 cells) so the front reads as spray, not a wipe. Fine overspray specks ride the front, coloured from the flag at that spot.
- **Colour** is the flag laid over the word's bounding box (stretched to fit; the word is ~3.3:1, the flag 2:1). Each dot samples the flag at its position with slight bleed across colour edges (±0.6% x, ±1.8% y). Result: Union Jack top-left, Commonwealth Star and Southern Cross to the right, navy field.
- **Density is driven by a "hand"**: two invisible nozzles drift over the word on independent smooth paths, each moving closer (small radius, high intensity) and further (large, soft). Paint density and brightness follow a Gaussian around each nozzle plus a slow low-frequency variation.
- **Coverage guarantee**: at least **84%** of the letter interior dots are always sprayed (constant `0.84 + 0.16·density`). The hand only changes brightness and thickness (two tiers: bright, and a 55% dim coat), never leaves the word mostly empty.
- **Paint brightness**: all paint buckets are drawn at 72% alpha (a "softer" coat) with a faint glow copy (≈14% alpha, 2.6× size) under the bright tier.
- **Persistent mist** around the nozzle after the first pass: ~70 specks × hand-intensity per frame, no visible dot.
- No vertical banding: colour comes from the flag, not from x position.

### 3.4 Clouds (intro only)
A cumulus bank round the word, built in the dot language: billows from 3D simplex noise (two octaves, slow drift), shaded as lit from the top-left (bright tops, darker undersides), stippled by per-dot hash, reach up to ~60 cells. The outline stays crisp (cloud starts 2.6 cells off it). **When the first pass completes, the clouds fade to zero over 2.5 s and only the ridge lines remain.** Reduced motion: never shown.

### 3.5 Wave sets (outward motion)
- Replaces the old single pulse. Every set is **7 waves**, each with its own strength (envelope `[0.42, 0.68, 0.92, 1.0, 0.8, 0.58, 0.36]` × a per-wave random factor 0.72–1.22).
- **Four independent quarters** (upper/lower × left/right of the word), each with its own period (16, 19, 14.5, 21 s), speed (17–23 cells/s), spacing (15–19), strength and offset, blended smoothly across the axes (smoothstep over ±14 cells horizontally, ±12 vertically).
- At a crest: ridges thicken (up to +55% width), stitch gaps close, brightness rises. Implemented as four 1-D tables over distance (`BINS = 480`, half-cell steps) rebuilt per frame; per-dot cost is a lookup and a bilinear blend.

### 3.6 Flow
- **Simplex noise** (`assets/vendor/simplex-noise/simplex-noise.js`, MIT, jwagner/simplex-noise.js v3.0.1) sampled on an 8-cell grid per frame and bilinearly interpolated per dot. Offsets ridge phase by up to ±1.7 cells, weighted to zero at the word so the defined lines near the letters stay put. Falls back to a trig field if the module cannot load.
- Ridges also **drift outward** slowly (`drift = t·0.9`).
- Down the page the pattern is unchanged in style; from the hero onward it is "one field".

### 3.7 Interaction
Cursor pushes dots away (radius 100 css px, force 40); a click sends a ripple (speed 225 px/s, width 37, force 20, 675 ms). Ignored over links/buttons/carousel/bag.

### 3.8 Workshop-gallery orbit (scroll section)
While the gallery track (`.lgc-track`) is on screen an envelope `env` (0 to 1 to 0, sine over the track's scroll range) turns on a **globe-like wrap**: dots are read through a spherical mapping of an oval whose long axis runs top-left to bottom-right. **One shared flow** (`P = env·(t·2.6 + scrollY·0.022)` cells) moves every dot along that axis, inside and outside the oval, so nothing is static beside anything moving; the oval only bends the flow and is never drawn. Lines on the oval brighten (×1.3) and push toward gold. Samples are never taken from inside the word.

### 3.9 Country-aware flag (planned, not built)
The flag is chosen from the visitor's country (currency/geo already suggested by the site), Australia default, manual switcher, same paint behaviour. Requires: per-country flag map, palette per flag (>3 colours needs a larger palette bucket set), legal check for flags used. Tracked in the proposal as P-B13.

### 3.10 Tunables (top of `draw()` and constants block)
`SPRAY_MS` 5200 · `PASS/beat` 700 ms · `PAL` (3 colours) · `NEON`=palette size · `PERIOD` 6.5 · `STITCH` 8 · `GAP` 3 · `WIDTH` 1.9 · `WAVES` 7 · per-quarter `Q[]` · `WWIDTH` 8.5 · cloud reach/limits in the cloud block · `FLOW_V` 2.6 · `FLOW_S` 0.022 · coverage 0.84.

---

## 4. Curved loop

`curved-loop.js`. Text on a quadratic path in an SVG whose width is 1440 units desktop and **640 units below 700 px** (curve depth ×0.6) so phone letters stay large. **Layout is arithmetic on word widths only**: each word is its own `<text><textPath>` positioned by `startOffset`; each star sits in a fixed slot (`SIZE + 2·0.55·FS`). No runs of spaces and no per-character API calls (both are inconsistent on iOS Safari). Star sprite `assets/brand/sparkle-3d.png` is finished in SVG: oxblood colour matrix, 1.1 px champagne rim, soft warm shadow, a moving glint clipped to the sprite's own alpha, 10% squash and ±3° wobble along the curve. Drag pushes it; releases keep direction. Off-screen it idles.

## 5. Workshop gallery

Third-party MIT component (Liquid Glass Carousel, componentry.dev), built React bundle in `assets/carousel/lgc.bundle.js`, patched for video and page-friendly wheel. `lgc-scroll.js` pins it (CSS sticky) inside a tall track (`--lgc-steps` × 65svh) and converts page scroll to slide steps by pressing the carousel's own arrow keys; a real drag/tap/key takes over until the next scroll. Height fills the pinned screen (up to 1100 px), brightness ×1.2. Copy is placeholder where consent is missing. Mouse gets a ruler cursor (`lgc-ruler.js`).

## 6. Bag

`bag-punch.js`. three.js scene with a GLB heavy bag, art textures per colourway, anime.js springs. **Products live in `PRODUCTS` (Tiger, Monogram); Dragon, Koi and Gold Vein are commented out for now.** Buttons and dots are generated from that array. Drag spins 360°, click punches (swing, twist, dent, shock ring); idle throws a combo every few seconds. **Entry spin**: on scroll-in the bag turns at the DNA's rate (0.55 turn per 210 px of scroll), tapering to zero at its resting place. Off-screen: not drawn.

## 7. Feature cards and the stitched overlay

Three 4:5 photo cards (`depth-card.js` tilt/parallax; `pixel-field.js` overlay). **Overlay appears only while hovered/touched** and is otherwise absent. It is one WebGL quad per card and one fragment shader: long soft lines of hairline gold running stitch, gently drifting on their own (noise-warped, alternate lines opposite ways), bending toward the pointer, glowing near it, rippling with speed; sewn in outward from the contact point (800 ms ease-out), cut off fast on exit (300 ms mouse, 520 ms touch). Edge fade keeps the stitched inset border (`::after`, dashed gold) clean. `window.__pixelField` exposes config and helpers.

## 8. Rise panel (footer) and Waitlist

- **Rise**: the section is tall; the stage is `position: sticky`. Panel position is a pure function of scroll (`--rise` 0 to 1) through a three-phase ease (early rise, plateau at ~60–64%, final rise, then scroll on through the footer via `--overflow`). Desktop and motion-allowed only; phones get a plain block. It pulls itself up over the previous pinned section (none on the home page now that the flare carousel is parked). Raised-layer cues: dimming layer, upward shadow, lit rim on the shaped top edge, lighter surface.
- **Artwork** `assets/brand/rise-card.svg` (2048×1152, shaped top edge). Three rows of gold running-stitch contour lines animate by CSS `stroke-dashoffset` (7, 9, 12 s; the slowest reversed). On phones the artwork is 92svh tall, fades into the card colour and the card colour continues to the end of the page.
- **Content**: Sanchez logo, "Build your identity" CTA (rolling-letter button ported from the mr-2 site: each character rolls up and is replaced from below, two-arrow send), **Waitlist**, minimal footer (logo with a live small globe beside it, origin line, cities, Instagram handles, © line and Terms/Privacy/Cookies). The full footer remains on every other page.
- **Waitlist**: heading "Waitlist", a list "Bag" then two redacted bars (intentionally mysterious: bags first, next products unannounced), an Email / Gmail / Other selector, one field, Submit, Privacy link. Validation: email pattern; Gmail requires @gmail.com / @googlemail.com; honeypot field. **Mocked** (localStorage `sz.waitlist`); no network. Real capture is business TODO #22.

## 9. Accessibility, reduced motion, fallbacks

- Reduced motion: hero paints fully coloured, no spray, no clouds, no waves, no flow, no orbit; rise panel is a plain block; bag entry spin off; curved loop still; pixel-field wave/drift off; stitch animation off.
- Decorative canvases are `aria-hidden`. The hero has a visually hidden `<h1>`. The waitlist has real labels, `role="status"` messages and keyboard-operable radios. Focus rings kept.
- No WebGL: the flare carousel/cards' overlay do nothing; content stays readable. Canvas 2D hero does not need WebGL.
- Touch: hover effects have touch equivalents (card overlay on touch); pointer effects are ignored where they would block scroll.

## 10. Performance

- One field canvas; dots drawn per colour bucket (no per-dot style changes). DPR capped 1.5 on coarse pointers, 2 otherwise; coarse pointers run at ~30 fps.
- Draw skipped beyond `fieldEnd` and while the tab is hidden. Off-screen sections pause their own loops (IntersectionObserver).
- Wave tables and noise grid are small typed arrays reused each frame; per-dot work is a few lookups.
- The pixel-field and rise panel run one rAF each. Textures preloaded; GPU objects disposed on destroy (flare carousel).
- Budgets from the master brief still apply to the production build: LCP < 2.5 s, INP < 200 ms, CLS < 0.1, non-3D JS ≤ 170 KB gz, 3D chunk ≤ 400 KB gz. The prototype has not been measured against these.

## 11. File map

```
prototype/
  index.html                 the page
  globe-hero.css             all home-page styles added over styles.css
  hero-rings.js              field, ridges, outline, flag paint, clouds, waves, orbit
  hero-cursor.js             custom cursor
  curved-loop.js             arc text + star sprites
  lgc-*.js, assets/carousel  workshop gallery
  marquee.js                 scroll-speed marquee
  bag-punch.js, assets/bag3d 3D bag
  depth-card.js, pixel-field.js   cards + stitched overlay
  dna-core.js                background helix
  rise-panel.js, assets/brand/rise-card.svg   footer rise
  waitlist.js                mock waitlist
  flare-carousel.js          parked (work-in-progress.html)
  assets/flag/               flag-3840.png, flag.svg
  assets/vendor/simplex-noise/   MIT noise
docs/TODO-business.md        open business decisions (waitlist = #22)
```

## 12. Open items and known gaps

1. **Country flags** (§3.9): only Australia exists. Needs geo/currency hook, flag maps, palette generalisation and a switcher.
2. **Waitlist backend**: provider, double opt-in, regional consent wording, storage, real Google/other sign-in (currently address types only).
3. **Performance measurement**: no Lighthouse or device profiling done; hero is the risk (per-frame full-page dot classification).
4. **Motion QA**: most effects were verified from still captures and unit checks, not long live sessions. Watch the wave sets, the hand and the orbit for at least a minute on desktop and a mid-range phone.
5. **Navy legibility**: the official flag navy (`#012169`) is nearly invisible on black, so a lifted navy is used; confirm with brand.
6. **Flag rights**: state emblems and flags are generally free to use, but check any use in advertising per market before adding more countries.
7. **Hero density on phones**: the stitched field has not been tuned for low-end Android.
8. **Production port**: the prototype is the visual source of truth; `apps/web` (Next.js) must re-implement the hero as a client component with the same constants, lazy-loaded, with a 2D fallback image for no-canvas and for reduced motion.
9. **Legal/evidence**: placeholder client names, any waitlist claims and country flags must pass the evidence rule before launch.
