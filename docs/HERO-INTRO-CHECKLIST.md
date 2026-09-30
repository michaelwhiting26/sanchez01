# Hero intro: full sequence (user brief, 30 Sep 2026). Do not drop any item.

1. Load: SANCHEZ + cloud effect present.
2. Clouds fade; bag silhouettes (3D Blender renders) come in SPINNING and settle into the letters.
3. When spin finishes: two black 3D silhouette runners (Blender, fluid run cycle) run L->R spray-painting with the EXISTING spray (unchanged), no stop-start.
4. Both run off right. One runs back, sprays "Custom", runs off again.
5. Paint: mostly inside the lettering (tiny overflow only); 3D water look, waves coming to a head; bubbles regularly through the spray; bubbles flow off the shape corners into the tan waves; slight colour leakage into tan waves WITHOUT changing tan waves (only added small colour elements).
6. Verify by capturing frames and measuring; meet the spec.
Also: reduced-motion / no-WebGL skip path; Custom signature waits for the runner.

## Opus plan (adopted)
Rules: spray density/motion/hand, coverage 0.84, FLAG_PALETTE, WAVES, tan buckets unchanged. Clouds fade BEFORE bags (engine currently fades after spray: reorder). Runner A/B nozzles drive spray nozzles 1/2 (keep small wander). 7 bags (one per letter), settle by shrink+crossfade into letters. Overflow = painted dots outside letter mask / all painted dots <= 3%. Play once per session; mirrored for run-back; mobile uses 256px sprites. Reduced motion: final state at once. No canvas: static SVG.
Assets: runner + bag = Blender pre-rendered sprite atlases (runner 24f/320px, bag 36f turntable) drawn on the existing canvas; water/bubbles/leakage inside Canvas2D engine (leakage drawn AFTER tan waves, alpha<=0.25). "Custom" = SVG dashoffset driven by runner B nozzle x. No GitHub repo needed.
Timeline ms: hold 0-600 | cloudFade 600-2100 | bagsIn 1500-3800 | settle 3400-4000 | runnersEnter 4000-4700 | spray 4700-9900 | runOff 9900-10900 | B back 11300-12300 | Custom 12300-14100 | B off 14100-15000 | bubbles from 5200 | corner flow from 9900.
Steps: 1 timeline.ts+tests (?heroT freeze) 2 reorder clouds [CP1] 3 runner atlas (fix nozzle: hand.head + normalized(hand.head - forearm.head)*0.18, world heads only) 4 bag turntable 5 sprites.ts [CP2] 6 bag settle 7 Custom callback 8 water.ts + engine.measure() [CP3] 9 fallbacks/perf [CP4]. Repo root IS git (sanchez01); commit at each checkpoint.

## Added 30 Sep 2026: hero -> page 2 seam
7. Scrolling past the hero (after the "Custom" Sanchez signature + diamond): take that part of the screen and let the tan wave dots flow LEFT so they meet the horizon of the golden arch, join the left edge of the screen, then flow continuously DOWN, so there is no visible break between the hero and the second page. (Extends the hero field's flow/orbit; the tan waves themselves keep their look.)

## Added 30 Sep 2026: DNA spine (after the hero intro)
8. Site as one 3D space built around a DNA helix on the page's centre axis, start to finish; existing elements attach to its turn. Candidates: Lenis (smooth scroll, ~/Code/libraries/lenis) + GSAP ScrollTrigger + three.js. Proof of concept first (2 sections), then attach the rest.

## Clarification 30 Sep 2026: items 7 + 8 are ONE system
The hero->page-2 flow (left to the arch horizon, left edge, then down) is the front-on view of everything orbiting the DNA centre axis in 3D. Build the seam and the DNA spine together: extend the field's existing orbit (ORBIT.axis, shared flow P) from the gallery to the whole stretch, helix on the same centre line. Tan waves keep their look; only the path changes.

## Change 30 Sep 2026 (user): ONE runner, not two
A single character sprays the word, runs off right, then runs back for "Custom" and runs off again. (Supersedes "two silhouettes / both run off / one returns".)
