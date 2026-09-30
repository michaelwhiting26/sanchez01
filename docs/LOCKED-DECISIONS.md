# Locked decisions (owner-approved, 30 Sep 2026)

The owner's current word on how each part of the site behaves. Anyone changing these parts (human or agent) reads this first and does not undo a line here without the owner saying so. Newest decision wins; when one changes, edit the line (do not append a contradicting rule elsewhere).

## Home, top to bottom
1. **Hero**: runner sprays SANCHEZ then "Custom". Runner = real clothed human silhouette (Mixamo Vanguard render, `tools/runner/render_runner.py --model soldier --arm 40,0,-60 --fore 0,0,-40`), not the mannequin. Spray comes from his nozzle in hand strokes, letter by letter (SPRAY tunables in `lib/hero/config.ts`); end state unchanged. Custom pass (owner 20:40, fast): walks in (~3 s), one crouch + one short scan, rises, tiptoes straight to the C, turns, quick can shake, first stroke ~8.5 s after walk-in; writes Custom (~8 s, random human pen pace, nozzle on the pen tip, LEGS STILL except a few deliberate repositions); then crouches hidden at the bottom-right of the calligraphy, completely still, until the visitor scrolls. ONE MAN ONLY: as the curved SANCHEZ • CUSTOM ribbon comes up, the hider himself backward-rolls (scroll-scrubbed) down onto the ribbon's top line (the hero runner hides that instant; reverses on scroll up), then crosses right→left throwing left-leg Muay Thai teeps (knee chambered, leg fully extended, toes pointed, step, repeat; guard up, upright), exiting left (lib/hero/handoff.ts, ribbon-sneak.ts). Next (queued): from the top-left he abseils down to the bottom of the gallery film strip, then moves right along the bottom and off the right edge, scroll-driven. Character: the approved Jesse 3D model (tools/runner/Jesse.glb) once its sheets are rendered. Runner look stays the black silhouette (the lit 'shaded' renders show an armoured soldier) until a proper casual character model exists. Then, on scroll, he tiptoes right-to-left along the top of the curved SANCHEZ • CUSTOM ribbon and exits left (ribbon-sneak.ts). Hero glass (`.wm-hero__glass`) is INVISIBLE: no edges, facets or sheen, only a slight contrast/colour/brightness lift.
2. **No auto-tour.** The site never scrolls itself.
3. **Workshop gallery** (the round film loop stays behind it): MR-2 pinned horizontal scroll, 1:1 with vertical scroll, at the visitor's pace. Keep the mechanic exactly. Strip = one continuous black film band (opaque, nothing shows through between frames) with crisp sprocket rails top and bottom. Must not jitter (compositor scroll-driven where supported). Tap a frame → lightbox with picture/video + title + caption ("Caption to come" until real copy exists).
4. **Spiral stretch**: after the gallery fully exits, the gold DNA spiral keeps travelling down an empty dark field (`.sz-transit`). Nothing else on screen, bag not visible.
5. **SANCHEZ rows**: three rows, big (current: `clamp(10rem, 4rem + 32vw, 32rem)`), each its own band, bleed off the sides; spiral dims behind them and keeps moving.
6. **Options band**: "Choose a product" + Bags / Gloves / Mitts pill sits **below the bag** (owner, 30 Sep 20:16; this replaces the earlier above-the-bag / start-empty order). The bag shows first (Tiger), and tapping a pill changes the product above in place. BagPunch's section className stays constant; React state is on data-* attributes so the engine's is-ready/is-revealed classes are never wiped.
7. **Hand-off**: spiral narrows and flicks onto the bag's chain ring (`.sz-handoff`), then the bag appears and spins in, landing with the Tiger face to the front.
7b. **2D Jesse** (`.jesse-2d`, from his Instagram pad-work footage) sits under the bag for now; the owner will reposition it.
8. **Footer**: globe large (`min(98vw, 480px)`; 400px desktop). Bag hangs under it on a chain, no background/box behind it, swings when tapped. **Waitlist Submit is tethered to the globe** (owner, 30 Sep 18:10, replacing the orbit): a wide Submit bar floats just above the globe, held by the globe's pull with NO visible tether line (owner, 19:25); it bobs and leans, is drawn a little towards the mouse, and springs back (`OrbitSubmit.tsx`). The Submit button is the site's red punch bag render (straps on, no chain) laid on its side, SUBMIT on the body (`/assets/brand/bag-button.webp`, owner 30 Sep 20:10).

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
- **Buttons are punch bags** (owner, 30 Sep 20:15): every labelled call-to-action (Order / Build yourself / Seriously, order, Build your identity, page buttons, builder buttons, share sheet) is the red bag render on its side, 3-slice so any label fits (`styles/bag-buttons.css`); secondary buttons are the same bag in black. Pills, arrows and icon toggles are not bags. The Submit bag keeps the rolling-letter tumble on hover.
