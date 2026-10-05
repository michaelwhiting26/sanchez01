# The mobile 3D store (home page), Parts 1 to 4

Built 5 Oct 2026 from the owner's engineering specification. The home page is now a 3D shop the visitor walks into. It is not a free-roaming game:
one persistent WebGL canvas, a fixed set of camera moves, and a state machine that decides everything. The previous scroll site is kept whole at
`/superseded`, linked from the store footer.

## The journey
1. **Arrive** (`arrive`): outside the workshop door. "Tap to enter". No sound and no Jesse speaking yet.
2. **Walk in** (`entering`): the door swings open and the camera walks a spline through it (2.8 s, a barely-there step rhythm).
3. **Jesse greets you** (`greeting`): he turns from the bench, steps forward, nods; captions carry the line; then he turns to the wall.
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
| Scripts that make the 3D files | `tools/store/build_store.py`, `tools/store/decimate_glb.py` |

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
| Workshop and shop front | Grey-box built by script. Not modelled on Jesse's real workshop (no footage yet). Lighting is live, not baked |
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
