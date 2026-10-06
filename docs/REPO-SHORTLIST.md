# GitHub repos: owner's decisions (6 Oct 2026)

From a search of GitHub against specs 04, 07 and 09. Stars and last-activity dates are as GitHub showed them on 6 Oct 2026. "Not tested" means nobody has run it against this project yet.

## In the site now
| Repo | What it does here | State |
|---|---|---|
| `pmndrs/detect-gpu` | Grades the phone's graphics chip so a known-slow phone starts on the reduced quality level | Wired in (`apps/web/src/three/gpu-grade.ts`, `LODController.tsx`). See "Starting quality level" in `STORE-3D.md` |
| `sparkjsdev/spark` | Shows a Gaussian splat scan inside three.js, for the scanned workshop in spec 04 | Installed only. Nothing uses it until a scan file of the real workshop exists |

## Probably worthwhile
| Repo | What it does | Waiting on |
|---|---|---|
| `DanielSWolf/rhubarb-lip-sync` (2,641 stars, Jun 2026) | Turns a voice recording into timed mouth shapes | Jesse's recorded lines, and a Jesse model with mouth shapes. Not tested |

## Saved for later
| Repo | What it does | Where it would fit |
|---|---|---|
| `Poly-Haven/polyhavenassets` (525 stars, Oct 2026) | Blender add-on for Poly Haven's free textures, HDRIs and models | Real timber, stone, iron and leather surfaces for the room and street. Not tested |
| `fabricjs/fabric.js` (31,469 stars, Oct 2026) | 2D design canvas for text, logos and images | Customers place their own name or logo, which is then wrapped onto the bag or glove. Not tested |

## No decision yet
| Repo | What it does | Where it would fit |
|---|---|---|
| `google/model-viewer` (8,263 stars, Oct 2026) | Shows a 3D model in the customer's room through the phone camera | The AR "v2 candidate" in spec 04. Not tested |

## Looked at and not adopted
| Repo | Finding |
|---|---|
| `Naxela/The_Lightmapper` | Supports Blender 5.1 and later, so it would run on this Mac's 5.2. Its bake is the same Blender call `tools/store/bake_light.py` already makes (Cycles diffuse, direct and bounced light). The existing script is also matched to the site's light units and stops a build when the room has changed, which the add-on does not do. No bake was run with it. Two of its options could be borrowed if the baked light ever looks grainy or blocky: baking at 2x or 4x size then shrinking, and Intel's denoiser. A copy is in `~/Code/libraries/The_Lightmapper` |
