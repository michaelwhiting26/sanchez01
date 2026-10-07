import { BLACK, BRASS, IVORY, look, type BuilderColourway, type BuilderPanels, type BuilderProduct, type BuilderZone } from "../builder/product";

/**
 * The groin guard, for the panel builder (lib/builder/product.ts): a padded front waist band, the cup, a hip wing each side, a rear band with a
 * closure flap, elastic belt and leg straps, and a lining.
 * The node names are the contract with `tools/groinguard/build_groinguard.py`, which makes the model. It is our own illustrative shape, not Jesse's pattern.
 * Logos and words go only on the two broad flat faces, the front waist band and the closure flap, so nothing is ever printed across a seam.
 */
export const GROINGUARD_PANELS = ["WAIST_FRONT", "CUP", "HIP_L", "HIP_R", "WAIST_BACK", "FLAP", "LINING", "BINDING", "ELASTIC", "STITCHING"] as const;
type GroinguardPanel = (typeof GROINGUARD_PANELS)[number];

const ELASTIC_BLACK = "#1b1b1d";

const ZONES: readonly BuilderZone[] = [
  { id: "front", label: "Front", hint: "Waist band and cup", parts: ["WAIST_FRONT", "CUP"] },
  { id: "hips", label: "Hips", hint: "The padded wing each side", parts: ["HIP_L", "HIP_R"], linked: ["HIP_L", "HIP_R"], linkedName: "Both hips" },
  { id: "back", label: "Back", hint: "Rear band and the closure flap", parts: ["WAIST_BACK", "FLAP"] },
  { id: "trim", label: "Trim", hint: "Lining, binding, elastic and stitching", parts: ["LINING", "BINDING", "ELASTIC", "STITCHING"] },
];

/** As it stands on the shop wall: black leather, brass binding, ivory stitching. */
const DEFAULTS: Readonly<Record<GroinguardPanel, ReturnType<typeof look>>> = {
  WAIST_FRONT: look(BLACK), CUP: look(BLACK), HIP_L: look(BLACK), HIP_R: look(BLACK), WAIST_BACK: look(BLACK), FLAP: look(BLACK),
  LINING: look("#17181b"), BINDING: look(BRASS), ELASTIC: look(ELASTIC_BLACK, "matte"), STITCHING: look(IVORY, "matte"),
};

/** `second` goes on the cup and the closure flap. The elastic stays as it is: it is bought in, not dyed to order. */
export function groinguardColourway(name: string, shell: string, second: string, trim: string): BuilderColourway {
  const colours: Readonly<Record<Exclude<GroinguardPanel, "ELASTIC">, string>> = {
    WAIST_FRONT: shell, HIP_L: shell, HIP_R: shell, WAIST_BACK: shell, CUP: second, FLAP: second, LINING: shell === IVORY ? second : "#17181b", BINDING: trim, STITCHING: trim,
  };
  return {
    name,
    swatch: [shell, second === shell ? trim : second],
    apply: (panels: BuilderPanels): BuilderPanels =>
      Object.fromEntries(GROINGUARD_PANELS.map((p) => [p, { hex: p === "ELASTIC" ? (panels[p]?.hex ?? ELASTIC_BLACK) : colours[p], finish: panels[p]?.finish ?? DEFAULTS[p].finish }])),
  };
}

export const GROINGUARD_PRODUCT: BuilderProduct = {
  id: "groin-guard",
  copy: {
    heading: "Design your groin guard",
    priceLabel: "Groin guard",
    reviewTitle: "Your groin guard",
    noun: "guard",
    standIn: "Illustrative groin guard shape. Jesse's own pattern replaces it when it is supplied.",
    reviewNote: "Price to come. Custom groin guard orders are not open yet: join the list and we will tell you when they are.",
  },
  saveKey: "sanchez.groinguard.v1",
  fileStem: "sanchez-custom-groin-guard",
  assets: {
    model: "/assets/groinguard/groinguard.glb",
    meta: "/assets/groinguard/groinguard.json",
    shading: "/assets/groinguard/groinguard-ao.webp",
    grain: "/assets/gloves/leather-grain-normal.webp", // the same leather, the same grain
  },
  panels: GROINGUARD_PANELS,
  panelNames: {
    WAIST_FRONT: "Waist band, front", CUP: "Cup", HIP_L: "Hip, left", HIP_R: "Hip, right", WAIST_BACK: "Waist band, back", FLAP: "Closure flap",
    LINING: "Lining", BINDING: "Binding", ELASTIC: "Elastic", STITCHING: "Stitching",
  },
  fixedNodes: [{ name: "BUCKLES", hex: ELASTIC_BLACK }],
  clothPanels: ["ELASTIC", "STITCHING"],
  artPanels: ["WAIST_FRONT", "FLAP"],
  artStart: { WAIST_FRONT: { u: 0.5, v: 0.5 }, FLAP: { u: 0.5, v: 0.5 } },
  logoStart: { panel: "WAIST_FRONT", size: 0.5 },
  wordsStart: { panel: "FLAP", size: 0.3 },
  zones: ZONES,
  colourwayZone: "front",
  defaults: DEFAULTS,
  colourways: [
    groinguardColourway("Black & Brass", BLACK, BLACK, BRASS),
    groinguardColourway("Fight Red", "#d7331f", "#d7331f", IVORY),
    groinguardColourway("Royal Blue", "#1f6fd1", "#1f6fd1", IVORY),
    groinguardColourway("Gold & Black", BLACK, "#d4a93a", "#d4a93a"),
    groinguardColourway("Ivory & Oxblood", IVORY, "#7c1d12", "#7c1d12"),
    groinguardColourway("Midnight", "#172a4d", "#172a4d", "#d4a93a"),
  ],
  faceAs: { STITCHING: "WAIST_FRONT", BINDING: "WAIST_FRONT", CUP: "WAIST_FRONT", ELASTIC: "FLAP", WAIST_BACK: "FLAP" },
  reviewViews: ["WAIST_FRONT", "HIP_R", "FLAP", "LINING"],
  fit: { tall: 0.86, wide: 0.86 },
};
