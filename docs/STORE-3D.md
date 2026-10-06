# The mobile 3D store (home page), Parts 1 to 4

Built 5 Oct 2026 from the owner's engineering specification. The home page is now a 3D shop the visitor walks into. It is not a free-roaming game:
one persistent WebGL canvas, a fixed set of camera moves, and a state machine that decides everything. The previous scroll site is kept whole at
`/superseded`, linked from the store footer.

## The journey
1. **Arrive** (`arrive`): outside the workshop door. "Tap to enter". No sound and no Jesse speaking yet.
2. **Walk in** (`entering`): the door swings open and the camera walks a spline through it (2.8 s, a barely-there step rhythm).
3. **Jesse greets you** (`greeting`): he turns from the bench, steps forward, nods; captions carry the line; then he turns to the wall.
   He ends on a question, and the visitor answers with one of four buttons: a product by name, everything, or looking around.
3b. **Look around** (`lookingAround`, optional): the camera returns to face Jesse's wall, he steps aside, and a marker on the wall opens a story (a short film with a line about it) over the store. "Back to the products" is always one tap away. It is never a step before buying.
4. **Swipe through products** (`browsing`): five products at five places on the back wall. Swipe, arrow keys, dots or tapping a product moves the camera sideways (0.65 s). Tapping the product in view, or "Design it", moves in close (`productSelected`); "Design this" opens `/build/<slug>`.

## Where things are
| What | Where |
|---|---|
| State machine (authoritative) | `apps/web/src/experience/store-machine.ts` |
| Products, voice lines, timings, entrance spline | `apps/web/src/lib/storefront/config.ts` |
| 3D scene | `apps/web/src/three/` (`World`, `Exterior`, `Workshop`, `ProductWall`, `Jesse`, `CinematicCamera`, `LODController`) |
| Camera controller, swipe rules, audio | `apps/web/src/three/CinematicCameraController.ts`, `SwipeController.ts`, `AudioController.ts` |
| Interface over the 3D | `apps/web/src/components/store/` |
| API | `GET /api/storefront/bootstrap`, `POST /api/storefront/events`, `POST /api/storefront/sessions` |
| Database tables | migration `002_storefront` in `apps/web/src/lib/db/migrations.ts` |
| 3D files | `apps/web/public/assets/store/` |
| Scripts that make the 3D files | `tools/store/build_store.py` (calls `iron_door.py`), `tools/store/decimate_glb.py` |
| Phone-size captures for sign-off | `node tools/store/capture.mjs` (390x844 and 430x932, dev server running) |

## Baking the room's light
The room must be baked again whenever its shape or its lights change. A build without `--bake` stops with "STALE BAKED LIGHT" if they have.

```
/Applications/Blender.app/Contents/MacOS/Blender -b --python-exit-code 1 -P tools/store/build_store.py -- --out apps/web/public/assets/store --bake
```

About two and a quarter minutes on this Mac (2048 px, 256 samples, GPU). It writes `workshop-light.webp` and `workshop-light.json` beside the 3D
files and `tools/store/baked/workshop-light.layout.npz`. All three, and `workshop.glb`, belong to one bake and are committed together.
The layout file matters: Blender packs the light layout differently on every run, so it is made once at bake time and every later build loads it.
In development, `?quality=full` on the address holds the full quality level so the live product shadow can be checked on a slow machine.

## Camera composition lives in Blender
`tools/store/build_store.py` writes named empties into `workshop.glb`: `CAM_PRODUCT_<X>`, `LOOK_PRODUCT_<X>`, `CAM_FOCUS_<X>`, `PRODUCT_<X>`
(X = GLOVES, BAG, THAI_PADS, MITTS, GUARDS), plus `JESSE_BENCH`, `JESSE_GREET`, `JESSE_ASIDE`, `CAM_GREETING`, `LOOK_GREETING`.
The site reads them at run time. To reframe a product, move its empty and re-run the script; no site code changes.

```
/Applications/Blender.app/Contents/MacOS/Blender -b -P tools/store/build_store.py -- --out apps/web/public/assets/store
```

## What is real and what is a stand-in (5 Oct 2026)
| Item | State |
|---|---|
| Heavy bag | Real model (the configurator's 5 ft bag), 139 KB |
| Focus mitts | Real model (mitt v3), reduced from 90 MB to 1.3 MB. The reduction left visible artefacts; needs a clean low-poly export. Over the 500 KB per-product target |
| Gloves, Thai pads, guards | Cloth-covered stand-in forms, labelled "Stand-in shape" on screen. No real models exist yet |
| Front door | Built 6 Oct 2026 from the owner's reference photo: a pair of wrought-iron leaves with scrollwork over glowing obscure glass (`tools/store/iron_door.py`, pattern in `door_pattern.py`, checked against the photo with `door_overlay.py`). Nodes `DOOR` and `DOOR_R`. `exterior.glb` is 1.12 MB uncompressed |
| Shop front | Built 6 Oct 2026 to the owner's storyboard (`tools/store/shop_front.py`): black timber front with pilasters, fascia and cornice, the sign in brass letters on the fascia (Cinzel, open licence), a window each side that looks into the workshop, wall and floor lanterns, dark brick above, stone setts. Brick and sett textures are generated by the script. Not modelled on a real building. `exterior.glb` is 1.55 MB uncompressed, over the 1.2 MB phone limit: compression is held back until a pixel comparison can show no visible change |
| Arrival shot and street light | Camera across the street at 50 degrees on a phone, opening to 62 as the visitor walks in (`CinematicCamera.tsx`, `lib/storefront/config.ts`). Night street with lantern light, fading to the room's light on entry (`Ambience` in `World.tsx`). No shadows, nothing baked |
| Workshop | Dressed 6 Oct 2026 to the owner's storyboard (`build_workshop` in `tools/store/build_store.py`): plank floor, plaster over dark panelling, beams, black-shaded pendants, a counter-and-cabinet station with a framed board for each product, a second work table, shelving with rolls and boxes, a heavy bag in the corner. Textures are generated by the script. Still invented, not Jesse's real workshop. `workshop.glb` is 0.61 MB |
| Jesse's sewing table and wall | Built 6 Oct 2026 from the two sewing films on his current site (`tools/store/jesse_workshop.py`; the films and stills are in the Dropbox project folder under `assets/workshop-reference`): industrial sewing machine, thread stand, jointed lamp with orange clamps, bobbin block, cones of thread, rolls; behind it a rail of hanging gloves, two frames, the tool board and a banner with his own logo. Built by eye, not measured. The pictures in his frames and other makers' glove branding are not copied. The greeting now ends across the room so this is what stands behind him |
| Product wall and room details | Added 6 Oct 2026 from the owner's four reference pictures (saved in the Dropbox project folder under `assets/inspiration-2026-10-06`): woven timber above the dado on the product wall; each shelf product in a green-marble alcove with a concealed light along its head; the heavy bag in front of a marble slab; brass T-hooks between the stations carrying a skipping rope, hand wraps and a speed bag; a stone bowl of rolled wraps on two counters; brass downlights; a brass line let into the floor; a woven green-leather bench in the middle of the room. Weave and marble textures are generated by the script. Ideas borrowed only: no other maker's name or mark, and no championship belts |
| Room light | Baked 6 Oct 2026 (Dropbox specs/09): the workshop's light and shadow are ray-traced in Blender by `tools/store/bake_light.py` and saved as `workshop-light.webp`, attached in `Workshop.tsx`. Live lights remain only for highlights, for the product in view (which casts the store's one live shadow, on the full quality level) and as a little fill for things that move. A soft patch sits under Jesse. The street is still lit live |
| Lens | 50 degrees on arrival and 54 inside on a phone; every standing point is composed for an upright phone |
| Jesse | The committed `Jesse.glb`, drawn as a dark silhouette because the character is not owner-approved. No mouth shapes, no wave or point clips |
| Voice and sound | None recorded. Captions carry the greeting. `audio` and `voice.*.src` in the config are null; nothing is faked with stock sound |
| Prices | None confirmed. Every product shows "Price to come" |
| Builders | Heavy bag goes to the existing `/configure`. The others show a placeholder and the waiting list |

## Not done yet (in the specification, not in this build)
- Baked lighting and KTX2 textures (needs the real room and the `ktx` tool; models use Meshopt and WebP today).
- Jesse's real model with LODs, facial shapes and the full clip list; recorded lines and their viseme files.
- Pre-rendered clips for the no-3D fallback (today it is the same products as a swipeable list).
- Products and versions served from the database (tables exist; the config file is the source for now).
- A consent review for the first-party funnel events (anonymous, per-tab id, no cookie).
- Real-phone performance testing. Desktop Chrome at phone size holds 60 fps; no device has been measured.
