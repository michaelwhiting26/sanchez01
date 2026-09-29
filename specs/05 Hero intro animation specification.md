# Sanchez home hero: lake reflection intro (SANCHEZ + Custom)

**Version:** 0.1, 29 Sep 2026 · **Status:** draft for approval · **Applies to:** `prototype/index.html` (Milestone 1), then `apps/web` home hero
**Replaces:** the two flickering wordmark banners (solid ↔ line, 1 s) currently in `index.html`.

## 1. The idea in one paragraph

The first screen is a stage on the cream banner. **SANCHEZ** appears in black. Below it, a thin horizontal "lake" line appears and a **mirrored, faded copy** of SANCHEZ appears under the line, like a reflection on water. After a beat, the reflection **rises through the lake and tumbles in 3D** (slow start, fast middle, slow finish, about 2.4 s), passes over the original and lands **exactly on top of it**, becoming one solid black SANCHEZ. SANCHEZ settles to the centre of the stage, then **Custom** (the gradient script with the white 3D outline) **drops in from above** and lands over the lower part of the word, Vice-City-lockup style. The sequence then hands over to the workshop video hero below.

Total: about **5.9 s**. Skippable at any moment.

## 2. Timeline

| t (s) | Duration | What happens | Property | Easing |
|---|---|---|---|---|
| 0.00 | 0.50 | SANCHEZ (A) appears | opacity 0→1, translateY 12px→0 | ease-out `cubic-bezier(.2,.7,.2,1)` |
| 0.35 | 0.60 | Lake line draws left to right | scaleX 0→1 (origin left) | ease-in-out |
| 0.70 | 0.60 | Reflection (B) appears under the line | opacity 0→0.35, gradient fade away from the line | ease-out |
| 1.30 | 0.70 | **Hold.** Both words on screen, faint ripple on B | ripple = subtle displacement, optional | n/a |
| 2.00 | 0.40 | Lake line and ripple fade out | opacity 1→0 | ease-in |
| **2.00** | **2.40** | **B rises and tumbles onto A** | see §4 | **`cubic-bezier(.76,0,.24,1)`** (slow, fast, slow) |
| 3.60 | 0.80 | B becomes fully solid as it lands | opacity 0.35→1 (last third of tumble) | linear |
| 4.40 | 0 | B and A are aligned; B is removed. One black SANCHEZ remains | display none on B | n/a |
| 4.40 | 0.60 | SANCHEZ slides to the vertical centre of the stage | translateY | ease-in-out |
| 5.00 | 0.90 | **Custom drops** and lands | see §5 | fall = ease-in, then settle |
| 5.90 | n/a | Done. Scroll cue fades in; video hero below is live | | |

## 3. Layout and layers

One **stage** replaces the banners. It is a fixed-height box, `height: min(100svh - header, 56vw)` on desktop, so nothing shifts when the animation finishes (CLS target 0).

```html
<section class="intro" data-phase="idle" aria-hidden="true">
  <div class="intro__stage">                       <!-- perspective: 1400px -->
    <img class="intro__a"      src="brand/sanchez-wordmark.svg">          <!-- solid black, transparent gaps -->
    <span class="intro__lake"></span>                                       <!-- 2px line, ink at 40% -->
    <div class="intro__b"><img src="brand/sanchez-wordmark.svg"></div>     <!-- reflection, same file -->
    <img class="intro__custom" src="brand/custom-script-smooth-3d-transparent.svg">
  </div>
</section>
```

- **A** sits above the stage centre; **B** sits directly below the lake line, mirrored (`rotateX(180deg)`). The gap between A and the lake equals the gap between the lake and B, so it reads as symmetrical.
- **Reflection look:** B is the same solid SVG at 35% opacity. Its wrapper has a mask that fades it out **away** from the lake (strongest at the line, gone at the bottom edge), like real water. The mask is driven by a registered CSS variable (`@property --fade`) so it can be animated away during the tumble.
- The dark `#0e1115` rectangle in the current Custom SVG must **not** appear here (see §7).

## 4. The tumble (the centrepiece)

B moves from below the lake to exactly over A while rotating about its **horizontal axis** through its own centre:

```css
@keyframes tumble {
  0%   { transform: translate3d(0, var(--rise), 0)      rotateX(180deg); }   /* mirrored, under the lake */
  50%  { transform: translate3d(0, calc(var(--rise) * .5), 220px) rotateX(450deg); } /* comes toward camera, over A */
  100% { transform: translate3d(0, 0, 0)                rotateX(720deg); }   /* upright, exactly on A */
}
```

- **180° → 720° is 1.5 full turns.** 720° equals 0°, so it ends upright and aligned. (A 540° end would land upside down: that's the value to avoid.)
- **`--rise`** = distance from B's start to A's position (word height + 2 × gap), set by script from measured sizes so it lands to the pixel.
- **Depth:** the +220px Z arc at the midpoint moves it toward the viewer while it crosses A, so the two words visibly pass over each other in 3D, then it settles back to Z = 0.
- **Easing:** `cubic-bezier(.76,0,.24,1)` over 2.4 s: slow lift-off, fast in the middle, soft landing. Stronger than standard ease-in-out, on purpose.
- `transform-origin: 50% 50%`; `backface-visibility: visible` (we want to see the back of the word as it flips).
- Only `transform` and `opacity` are animated during the tumble: no filters, no layout.

## 5. Custom drops in

- Starts above the stage (`translateY(-130%)`, clipped by `overflow: hidden` on the stage) and rotated −6°.
- **Keyframes (0.9 s):** 0–55% fall with gravity-style ease-in (`cubic-bezier(.5,0,.9,.45)`) to the landing spot; 55–70% small overshoot (+3%, scaleY .96, the "impact"); 70–100% settle to rest at −3° rotation.
- **Landing spot:** right-of-centre, overlapping the lower third of SANCHEZ, about 78% of SANCHEZ's width (as in the lockup mock-up).
- **Impact detail (140 ms):** SANCHEZ moves down 2px and back, and Custom's drop shadow tightens (blur 24→8). Adds weight without extra assets.
- The white outline of Custom sits over black letters, which is where it reads best.

## 6. Interaction, accessibility, performance

- **Skip:** click, tap, key press or scroll during the sequence jumps to the end state (200 ms cross-fade). Scrolling is never locked.
- **Once per session** (`sessionStorage["sz.intro"]`). Repeat visits and back-navigation show the end state. A "Replay intro" link goes in the prototype's footer tools box.
- **`prefers-reduced-motion: reduce`:** show the end state immediately (SANCHEZ + Custom, no motion).
- The whole stage is `aria-hidden`; the real `<h1>` is in the video hero below. No flashing (nothing changes faster than 1 Hz).
- **Performance:** `will-change: transform, opacity` only on B and Custom, removed at `data-phase="done"`; the two SVGs are the LCP candidates and must be preloaded; keep each under 100 KB (solid wordmark is 80 KB, Custom is about 90 KB and can be reduced). Target 60 fps on a mid-range phone; if frames drop below 45 fps, skip straight to the end state.
- **Sequencing:** one `data-phase` attribute (`idle → appear → hold → tumble → settle → drop → done`) advanced on `animationend`, so timings live in CSS and can't drift.

## 7. Assets

| Asset | Status |
|---|---|
| Solid SANCHEZ (`sanchez-wordmark.svg`) | Exists. Transparent gaps, black fill. Used for both A and B. |
| Custom (`custom-script-smooth-3d.svg`) | Exists, but has a dark `#0e1115` background rectangle and a **white** outline. Needs a **transparent-background** export. |
| Lake line, ripple | CSS only (ripple optional: `feTurbulence` + `feDisplacementMap`, subtle). |

**Design risk:** Custom's white outline and glow were designed for a dark background. On the **cream** banner the outline is low-contrast except where it overlaps black SANCHEZ. Decision needed (§8).

## 8. Open decisions for Michael

1. **Banner colour during the intro:** keep cream (Custom's white outline only shows over the black letters; strengthen its drop shadow), **or** switch the stage to the dark brand ink so Custom's glow and gradient shine. My recommendation: **dark stage**, with cream SANCHEZ letters as a variant to test.
2. **Reflection style:** solid mirrored copy at 35% (recommended), or the line version of SANCHEZ.
3. **After the merge:** SANCHEZ slides to centre (as specified), or stays where A began.
4. **Custom's final position:** overlapping the lower third of SANCHEZ (as specified), or fully below it.
5. **Ripple:** include the water-ripple on the reflection (adds about 1 KB and a small GPU cost), or keep it clean.

## 9. Acceptance checks

- The tumble ends with B pixel-aligned to A (no visible double edge, verified at 1440 and 390 px widths).
- No layout shift (CLS 0), and LCP under 2.5 s with the intro running.
- 60 fps on desktop Chrome; reduced-motion shows the end state at once; skip works at every phase.
- The text of the page is reachable by keyboard and screen reader while the intro plays.
