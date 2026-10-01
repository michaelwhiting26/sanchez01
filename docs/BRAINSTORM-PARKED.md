# Parked ideas (brainstorming, NOT in the current build)

## Multi-product funnel pill (Bag / Mitts / Gloves / Pads), parked 30 Sep 2026
Idea: an elegant continuous pill slider under the bag section to pick the product (Bag, Mitts, Gloves, ...), then into the build funnel.
Why parked (Michael's call): the site is a single-product funnel to buy the bag. Extra categories add choice and distraction and are likely to lower click-through and buy-through on the bag. Revisit only once the bag funnel is converting and there is data to show demand for other products.
Assets kept for later: `docs/parked/mitts-cutout.webp` (cut-out of `mitt_front.png` from the Blender mitt v3 render, from Dropbox 15. sanchezboxing/MW DESIGNS/3d-render-exports/mitt_v3_blender). No glove render exists yet. Evidence rule applies to copy: nothing about mitts/gloves is claimed until Jesse confirms the range.
Design notes if revived: segmented pill, sliding thumb, radiogroup semantics, one category per screen, CTAs "Order this bag" / "Build yourself" reused.

## 2D Jesse pad-work cutout under the bag, parked 1 Oct 2026
Idea: a flat-colour illustrated Jesse (cut from his Instagram pad-work footage) standing under the bag section (`.jesse-2d`, locked decision 7b "for now; the owner will reposition it").
Why parked (Michael's call, 1 Oct): removed from the homepage. Jesse appears as the 3D runner through the whole page instead (CLAUDE.md master rule), and the 2D cutout is a second, different-looking figure.
Assets kept: `docs/parked/jesse-2d-pads.webp` (copy). The live file `apps/web/public/assets/jesse/jesse-pads.webp` is left in place (nothing references it now).
Revive: re-add the `<section className="jesse-2d">` block after `<BagPunch />` in `app/page.tsx`; its styles (`.jesse-2d`) were left in place.
