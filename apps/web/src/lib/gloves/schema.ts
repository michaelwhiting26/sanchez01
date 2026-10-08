import { BLACK, BRASS, IVORY, look, type BuilderColourway, type BuilderPanels, type BuilderProduct, type BuilderZone } from "../builder/product";

/**
 * The gloves, for the panel builder (lib/builder/product.ts). One glove model, cut into the panels a glove is sewn from.
 * The node names are the contract with `tools/gloves/build_glove.py`, which makes the model.
 */
export const GLOVE_PANELS = ["HAND_BACK", "PALM", "THUMB_OUT", "THUMB_IN", "THUMB_STRIP", "CUFF_BACK", "CUFF_PALM", "BINDING", "PIPING", "STITCHING", "LACES"] as const;
type GlovePanel = (typeof GLOVE_PANELS)[number];

const ZONES: readonly BuilderZone[] = [
  { id: "hand", label: "Hand", hint: "Back and palm are separate: make it two-tone", parts: ["HAND_BACK", "PALM"] },
  { id: "thumb", label: "Thumb", hint: "Outside, inside and the joining strip", parts: ["THUMB_OUT", "THUMB_IN", "THUMB_STRIP"], linked: ["THUMB_OUT", "THUMB_IN", "THUMB_STRIP"], linkedName: "Whole thumb" },
  { id: "cuff", label: "Cuff", hint: "The wrist, back and lace side", parts: ["CUFF_BACK", "CUFF_PALM"], linked: ["CUFF_BACK", "CUFF_PALM"], linkedName: "Whole cuff" },
  { id: "trim", label: "Trim", hint: "Binding, piping, stitching and laces", parts: ["BINDING", "PIPING", "STITCHING", "LACES"] },
];

/** The glove as it stands on the shop wall: black leather, brass piping, ivory laces. */
const DEFAULTS: Readonly<Record<GlovePanel, ReturnType<typeof look>>> = {
  HAND_BACK: look(BLACK), PALM: look(BLACK), THUMB_OUT: look(BLACK), THUMB_IN: look(BLACK), THUMB_STRIP: look(BLACK),
  CUFF_BACK: look(BLACK), CUFF_PALM: look(BLACK), BINDING: look(IVORY), PIPING: look(BRASS), STITCHING: look(IVORY, "matte"), LACES: look(IVORY, "matte"),
};

/** `second` goes on the palm, the inside of the thumb and the cuff. Laces never go black on a black glove. */
export function gloveColourway(name: string, hand: string, second: string, trim: string): BuilderColourway {
  const colours: Readonly<Record<GlovePanel, string>> = {
    HAND_BACK: hand, THUMB_OUT: hand, PALM: second, THUMB_IN: second, THUMB_STRIP: second, CUFF_BACK: second, CUFF_PALM: second,
    BINDING: trim, PIPING: trim, STITCHING: trim, LACES: trim === BLACK ? IVORY : trim,
  };
  return {
    name,
    swatch: [hand, trim],
    apply: (panels: BuilderPanels): BuilderPanels => Object.fromEntries(GLOVE_PANELS.map((p) => [p, { hex: colours[p], finish: panels[p]?.finish ?? DEFAULTS[p].finish }])),
  };
}

export const GLOVE_PRODUCT: BuilderProduct = {
  id: "gloves",
  copy: {
    heading: "Design your gloves",
    priceLabel: "Custom gloves",
    reviewTitle: "Your gloves",
    noun: "glove",
    standIn: "Illustrative glove shape. Jesse's own pattern replaces it when it is supplied.",
    reviewNote: "Both gloves are made the same, as a mirrored pair. Price to come. Online ordering is not open yet: send this design to Jesse and he will quote it.",
  },
  saveKey: "sanchez.glove.v1",
  fileStem: "sanchez-custom-gloves",
  assets: {
    model: "/assets/gloves/glove.glb",
    meta: "/assets/gloves/glove.json",
    shading: "/assets/gloves/glove-ao.webp",
    grain: "/assets/gloves/leather-grain-normal.webp",
  },
  panels: GLOVE_PANELS,
  panelNames: {
    HAND_BACK: "Back of hand", PALM: "Palm", THUMB_OUT: "Thumb, outside", THUMB_IN: "Thumb, inside", THUMB_STRIP: "Thumb strip",
    CUFF_BACK: "Cuff, back", CUFF_PALM: "Cuff, lace side", BINDING: "Cuff binding", PIPING: "Piping", STITCHING: "Stitching", LACES: "Laces",
  },
  fixedNodes: [{ name: "LINING", hex: "#0c0c0d" }],
  clothPanels: ["STITCHING", "LACES"],
  artPanels: ["HAND_BACK", "CUFF_BACK", "PALM", "THUMB_OUT", "CUFF_PALM"],
  // the back-of-hand panel runs on over the knuckles, so its flat part is below the middle
  artStart: { HAND_BACK: { u: 0.5, v: 0.7 }, CUFF_BACK: { u: 0.5, v: 0.5 }, PALM: { u: 0.5, v: 0.5 }, THUMB_OUT: { u: 0.5, v: 0.5 }, CUFF_PALM: { u: 0.5, v: 0.5 } },
  logoStart: { panel: "HAND_BACK", size: 0.3 },
  wordsStart: { panel: "CUFF_BACK", size: 0.24 },
  zones: ZONES,
  colourwayZone: "hand",
  defaults: DEFAULTS,
  colourways: [
    gloveColourway("Black & Brass", BLACK, BLACK, BRASS),
    gloveColourway("Fight Red", "#d7331f", "#d7331f", IVORY),
    gloveColourway("Royal Blue", "#1f6fd1", "#1f6fd1", IVORY),
    gloveColourway("Gold & Black", "#d4a93a", BLACK, "#d4a93a"),
    gloveColourway("Ivory & Oxblood", IVORY, "#7c1d12", "#7c1d12"),
    gloveColourway("Midnight", "#172a4d", "#172a4d", "#d4a93a"),
  ],
  faceAs: { PIPING: "HAND_BACK", STITCHING: "HAND_BACK", LACES: "CUFF_PALM", BINDING: "CUFF_BACK", THUMB_STRIP: "THUMB_IN" },
  reviewViews: ["HAND_BACK", "THUMB_OUT", "PALM", "CUFF_BACK"],
  fit: { tall: 0.8, wide: 0.44 },
};
