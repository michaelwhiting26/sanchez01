# Locked decisions (owner-approved, 30 Sep 2026)

The owner's current word on how each part of the site behaves. Anyone changing these parts (human or agent) reads this first and does not undo a line here without the owner saying so. Newest decision wins; when one changes, edit the line (do not append a contradicting rule elsewhere).

## Home, top to bottom
1. **Hero**: runner sprays SANCHEZ then "Custom". Runner = real clothed human silhouette (Mixamo Vanguard render, `tools/runner/render_runner.py --model soldier --arm 40,0,-60 --fore 0,0,-40`), not the mannequin. Spray comes from his nozzle in hand strokes, letter by letter (SPRAY tunables in `lib/hero/config.ts`); end state unchanged. Custom pass (suspicious, unhurried): eases in from the right, standing look back/forward twice, crouches and scans (head visibly moving), peeks, glance, rises, tiptoes with a listen-freeze and a spooked duck, glances back, turns to the wall, shakes the can, writes Custom (~8 s, random human pen pace, nozzle on the pen tip, LEGS STILL except a few deliberate repositions between stands), then tiptoes to the bottom-right of the calligraphy and crouches hidden, completely still, forever (writer.ts, INTRO in config.ts). Runner look stays the black silhouette (the lit 'shaded' renders show an armoured soldier) until a proper casual character model exists. Then, on scroll, he tiptoes right-to-left along the top of the curved SANCHEZ • CUSTOM ribbon and exits left (ribbon-sneak.ts). Hero glass (`.wm-hero__glass`) is INVISIBLE: no edges, facets or sheen, only a slight contrast/colour/brightness lift.
2. **No auto-tour.** The site never scrolls itself.
3. **Workshop gallery** (the round film loop stays behind it): MR-2 pinned horizontal scroll, 1:1 with vertical scroll, at the visitor's pace. Keep the mechanic exactly. Strip = one continuous black film band (opaque, nothing shows through between frames) with crisp sprocket rails top and bottom. Must not jitter (compositor scroll-driven where supported). Tap a frame → lightbox with picture/video + title + caption ("Caption to come" until real copy exists).
4. **Spiral stretch**: after the gallery fully exits, the gold DNA spiral keeps travelling down an empty dark field (`.sz-transit`). Nothing else on screen, bag not visible.
5. **SANCHEZ rows**: three rows, big (current: `clamp(10rem, 4rem + 32vw, 32rem)`), each its own band, bleed off the sides; spiral dims behind them and keeps moving.
6. **Options band**: Bags / Gloves / Mitts pill on its own beat after the rows, before the bag, with a one-time highlight so nobody misses the toggles. Bag still not visible. **Starts with nothing chosen** (owner, 30 Sep 19:40): "Choose a product" leads, the bag area is empty (a small "Choose a product above" prompt), and picking a product reveals it and scrolls down to it. BagPunch's section className stays constant; React state is on data-* attributes so the engine's is-ready/is-revealed classes are never wiped.
7. **Hand-off**: spiral narrows and flicks onto the bag's chain ring (`.sz-handoff`), then the bag appears and spins in, landing with the Tiger face to the front.
7b. **2D Jesse** (`.jesse-2d`, from his Instagram pad-work footage) sits under the bag for now; the owner will reposition it.
8. **Footer**: globe large (`min(98vw, 480px)`; 400px desktop). Bag hangs under it on a chain, no background/box behind it, swings when tapped. **Waitlist Submit is tethered to the globe** (owner, 30 Sep 18:10, replacing the orbit): a wide Submit bar floats just above the globe, held by the globe's pull with NO visible tether line (owner, 19:25); it bobs and leans, is drawn a little towards the mouse, and springs back (`OrbitSubmit.tsx`).

## Build flow (/configure)
- One question at a time, top-to-bottom order, every answer pre-selected. Tapping an answer only selects it (outlined); **Next** moves on.
- Every visual option changes the 3D bag. Size change must be visible (camera fixed to the 5 ft bag) plus the ft/cm label.
- Payment sheet never covers the bag; scene pills (Studio, Gym, Garage, Outdoor, Your room); Your-room photo stays on the phone; Save picture.

## Product page (/product)
- Heavy bag: "Build yourself" only (no waitlist). "More from Sanchez" carousel below; not-yet-made products carry the waitlist.

## Always
- Evidence rule: no invented prices, specs, products, claims; mark PLACEHOLDER.
- "Designed in Sydney. Handmade in Pattaya."
- Push to `main`; owner views on the Mac dev server `http://192.168.1.115:3000`.
