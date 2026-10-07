import { BLACK, BRASS, IVORY, look, type BuilderColourway, type BuilderPanels, type BuilderProduct, type BuilderZone } from "../builder/product";

/**
 * The head guard, for the panel builder (lib/builder/product.ts). A full-face training guard: brow band, cheek protectors, chin bar, side panels,
 * a padded back with a closure strap, a laced open top, and a lining that shows through the face opening.
 * The node names are the contract with `tools/headguard/build_headguard.py`, which makes the model. It is our own illustrative shape, not Jesse's pattern.
 * Logos and words go only on the two broad flat faces, the brow and the strap, so nothing is ever printed across a seam.
 */
export const HEADGUARD_PANELS = ["FOREHEAD", "CHEEK_L", "CHEEK_R", "CHIN", "SIDE_L", "SIDE_R", "BACK_PAD", "STRAP", "TOP_TABS", "LINING", "BINDING", "STITCHING", "LACES"] as const;
type HeadguardPanel = (typeof HEADGUARD_PANELS)[number];

const ZONES: readonly BuilderZone[] = [
  { id: "front", label: "Front", hint: "Brow, cheeks and chin", parts: ["FOREHEAD", "CHEEK_L", "CHEEK_R", "CHIN"], linked: ["CHEEK_L", "CHEEK_R"], linkedName: "Both cheeks" },
  { id: "sides", label: "Sides", hint: "The panels over the ears", parts: ["SIDE_L", "SIDE_R"], linked: ["SIDE_L", "SIDE_R"], linkedName: "Both sides" },
  { id: "back", label: "Back", hint: "Rear pad, strap and the tabs over the top", parts: ["BACK_PAD", "STRAP", "TOP_TABS"] },
  { id: "trim", label: "Trim", hint: "Lining, binding, stitching and laces", parts: ["LINING", "BINDING", "STITCHING", "LACES"] },
];

/** As it stands on the shop wall: black leather, ivory lining, brass binding. */
const DEFAULTS: Readonly<Record<HeadguardPanel, ReturnType<typeof look>>> = {
  FOREHEAD: look(BLACK), CHEEK_L: look(BLACK), CHEEK_R: look(BLACK), CHIN: look(BLACK), SIDE_L: look(BLACK), SIDE_R: look(BLACK),
  BACK_PAD: look(BLACK), STRAP: look(BLACK), TOP_TABS: look(BLACK), LINING: look(IVORY), BINDING: look(BRASS),
  STITCHING: look(IVORY, "matte"), LACES: look(IVORY, "matte"),
};

/** `second` goes on the cheeks, the strap and the top tabs. Laces never match a black shell. */
export function headguardColourway(name: string, shell: string, second: string, lining: string, trim: string): BuilderColourway {
  const colours: Readonly<Record<HeadguardPanel, string>> = {
    FOREHEAD: shell, CHIN: shell, SIDE_L: shell, SIDE_R: shell, BACK_PAD: shell, CHEEK_L: second, CHEEK_R: second, STRAP: second, TOP_TABS: second,
    LINING: lining, BINDING: trim, STITCHING: trim, LACES: trim === BLACK ? IVORY : trim,
  };
  return {
    name,
    swatch: [shell, second === shell ? trim : second],
    apply: (panels: BuilderPanels): BuilderPanels => Object.fromEntries(HEADGUARD_PANELS.map((p) => [p, { hex: colours[p], finish: panels[p]?.finish ?? DEFAULTS[p].finish }])),
  };
}

export const HEADGUARD_PRODUCT: BuilderProduct = {
  id: "head-guard",
  copy: {
    heading: "Design your head guard",
    priceLabel: "Custom head guard",
    reviewTitle: "Your head guard",
    noun: "head guard",
    standIn: "Illustrative head guard shape. Jesse's own pattern replaces it when it is supplied.",
    reviewNote: "Price to come. Custom head guard orders are not open yet: join the list and we will tell you when they are.",
  },
  saveKey: "sanchez.headguard.v1",
  fileStem: "sanchez-custom-head-guard",
  assets: {
    model: "/assets/headguard/headguard.glb",
    meta: "/assets/headguard/headguard.json",
    shading: "/assets/headguard/headguard-ao.webp",
    grain: "/assets/gloves/leather-grain-normal.webp", // the same leather, the same grain
  },
  panels: HEADGUARD_PANELS,
  panelNames: {
    FOREHEAD: "Brow", CHEEK_L: "Cheek, left", CHEEK_R: "Cheek, right", CHIN: "Chin", SIDE_L: "Side, left", SIDE_R: "Side, right",
    BACK_PAD: "Back pad", STRAP: "Strap", TOP_TABS: "Top tabs", LINING: "Lining", BINDING: "Binding", STITCHING: "Stitching", LACES: "Laces",
  },
  fixedNodes: [],
  clothPanels: ["STITCHING", "LACES"],
  artPanels: ["FOREHEAD", "STRAP"],
  artStart: { FOREHEAD: { u: 0.5, v: 0.5 }, STRAP: { u: 0.5, v: 0.5 } },
  logoStart: { panel: "FOREHEAD", size: 0.5 },
  wordsStart: { panel: "STRAP", size: 0.4 },
  zones: ZONES,
  colourwayZone: "front",
  defaults: DEFAULTS,
  colourways: [
    headguardColourway("Black & Brass", BLACK, BLACK, IVORY, BRASS),
    headguardColourway("Fight Red", "#d7331f", "#d7331f", IVORY, IVORY),
    headguardColourway("Royal Blue", "#1f6fd1", "#1f6fd1", IVORY, IVORY),
    headguardColourway("Gold & Black", BLACK, "#d4a93a", BLACK, "#d4a93a"),
    headguardColourway("Ivory & Oxblood", IVORY, "#7c1d12", "#7c1d12", "#7c1d12"),
    headguardColourway("Midnight", "#172a4d", "#172a4d", IVORY, "#d4a93a"),
  ],
  faceAs: { STITCHING: "FOREHEAD", BINDING: "FOREHEAD", LINING: "FOREHEAD", LACES: "TOP_TABS", CHIN: "FOREHEAD" },
  reviewViews: ["FOREHEAD", "SIDE_R", "STRAP", "SIDE_L"],
  fit: { tall: 0.86, wide: 0.72 },
};
