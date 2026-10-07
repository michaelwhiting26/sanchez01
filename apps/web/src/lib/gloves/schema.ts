import { FINISHES, PART_PALETTE, type Finish } from "../configurator/schema";

/**
 * The glove builder's data. One glove model, cut into the panels a glove is sewn from; every panel takes its own colour and finish, and the
 * larger panels take logos and words. Evidence rule: no price, weight range or leather grade is stated here because none is confirmed.
 * The node names are the contract with `tools/gloves/build_glove.py`, which makes the model.
 */
export const GLOVE_ASSETS = {
  model: "/assets/gloves/glove.glb",
  meta: "/assets/gloves/glove.json",
  shading: "/assets/gloves/glove-ao.webp",
  grain: "/assets/gloves/leather-grain-normal.webp",
} as const;

export const PANELS = ["HAND_BACK", "PALM", "THUMB_OUT", "THUMB_IN", "THUMB_STRIP", "CUFF_BACK", "CUFF_PALM", "BINDING", "PIPING", "STITCHING", "LACES"] as const;
export type PanelId = (typeof PANELS)[number];
/** Drawn but never coloured by the visitor. */
export const FIXED_NODES = ["LINING"] as const;

/** Panels large and flat enough to carry a logo or words. */
export const ART_PANELS = ["HAND_BACK", "CUFF_BACK", "PALM", "THUMB_OUT", "CUFF_PALM"] as const satisfies readonly PanelId[];
export type ArtPanelId = (typeof ART_PANELS)[number];
export const isArtPanel = (p: string): p is ArtPanelId => (ART_PANELS as readonly string[]).includes(p);
export const isPanel = (p: string): p is PanelId => (PANELS as readonly string[]).includes(p);

export const PANEL_NAMES: Readonly<Record<PanelId, string>> = {
  HAND_BACK: "Back of hand", PALM: "Palm", THUMB_OUT: "Thumb, outside", THUMB_IN: "Thumb, inside", THUMB_STRIP: "Thumb strip",
  CUFF_BACK: "Cuff, back", CUFF_PALM: "Cuff, lace side", BINDING: "Cuff binding", PIPING: "Piping", STITCHING: "Stitching", LACES: "Laces",
};

export interface GloveZone {
  readonly id: "hand" | "thumb" | "cuff" | "trim";
  readonly label: string;
  readonly hint: string;
  readonly parts: readonly PanelId[];
  /** Parts that take the same colour until the visitor asks to edit each. */
  readonly linked?: readonly PanelId[];
  readonly linkedName?: string;
}

export const GLOVE_ZONES: readonly GloveZone[] = [
  { id: "hand", label: "Hand", hint: "Back and palm are separate: make it two-tone", parts: ["HAND_BACK", "PALM"] },
  { id: "thumb", label: "Thumb", hint: "Outside, inside and the joining strip", parts: ["THUMB_OUT", "THUMB_IN", "THUMB_STRIP"], linked: ["THUMB_OUT", "THUMB_IN", "THUMB_STRIP"], linkedName: "Whole thumb" },
  { id: "cuff", label: "Cuff", hint: "The wrist, back and lace side", parts: ["CUFF_BACK", "CUFF_PALM"], linked: ["CUFF_BACK", "CUFF_PALM"], linkedName: "Whole cuff" },
  { id: "trim", label: "Trim", hint: "Binding, piping, stitching and laces", parts: ["BINDING", "PIPING", "STITCHING", "LACES"] },
];
export const zoneOfPanel = (p: PanelId): GloveZone => GLOVE_ZONES.find((z) => z.parts.includes(p)) ?? (GLOVE_ZONES[0] as GloveZone);

export const GLOVE_PALETTE = PART_PALETTE;
export const GLOVE_FINISHES = FINISHES;
export const FINISH_NAMES: Readonly<Record<Finish, string>> = { gloss: "Gloss", satin: "Satin", matte: "Matte", metallic: "Metallic" };
/** Thread and lace parts are cloth: they take a colour but not a leather finish. */
export const CLOTH_PANELS: readonly PanelId[] = ["STITCHING", "LACES"];

/** What a finish does to the leather: the same four finishes as the bag, so the two builders agree. */
export const FINISH_RECIPE: Readonly<Record<Finish, { roughness: number; metalness: number; clearcoat: number; clearcoatRoughness: number }>> = {
  gloss: { roughness: 0.3, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.18 },
  satin: { roughness: 0.5, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.4 },
  matte: { roughness: 0.86, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.4 },
  metallic: { roughness: 0.34, metalness: 0.7, clearcoat: 0.4, clearcoatRoughness: 0.4 },
};

export interface PanelLook {
  readonly hex: string;
  readonly finish: Finish;
}
export type GlovePanels = Readonly<Record<PanelId, PanelLook>>;

const BLACK = "#111316";
const IVORY = "#eeece6";
const BRASS = "#c8954d";
const look = (hex: string, finish: Finish = "satin"): PanelLook => ({ hex, finish });

/** The glove as it stands on the shop wall: black leather, brass piping, ivory laces. */
export const DEFAULT_PANELS: GlovePanels = {
  HAND_BACK: look(BLACK), PALM: look(BLACK), THUMB_OUT: look(BLACK), THUMB_IN: look(BLACK), THUMB_STRIP: look(BLACK),
  CUFF_BACK: look(BLACK), CUFF_PALM: look(BLACK), BINDING: look(IVORY), PIPING: look(BRASS), STITCHING: look(IVORY, "matte"), LACES: look(IVORY, "matte"),
};

export interface GloveColourway {
  readonly name: string;
  readonly hand: string;
  readonly second: string;
  readonly trim: string;
}
/** Starting points that set every panel at once. `second` goes on the palm, the inside of the thumb and the cuff. */
export const GLOVE_COLOURWAYS: readonly GloveColourway[] = [
  { name: "Black & Brass", hand: BLACK, second: BLACK, trim: BRASS },
  { name: "Fight Red", hand: "#d7331f", second: "#d7331f", trim: IVORY },
  { name: "Royal Blue", hand: "#1f6fd1", second: "#1f6fd1", trim: IVORY },
  { name: "Gold & Black", hand: "#d4a93a", second: BLACK, trim: "#d4a93a" },
  { name: "Ivory & Oxblood", hand: IVORY, second: "#7c1d12", trim: "#7c1d12" },
  { name: "Midnight", hand: "#172a4d", second: "#172a4d", trim: "#d4a93a" },
];

export function applyColourway(panels: GlovePanels, w: GloveColourway): GlovePanels {
  const keep = (p: PanelId, hex: string): PanelLook => ({ hex, finish: panels[p].finish });
  return {
    HAND_BACK: keep("HAND_BACK", w.hand), THUMB_OUT: keep("THUMB_OUT", w.hand),
    PALM: keep("PALM", w.second), THUMB_IN: keep("THUMB_IN", w.second), THUMB_STRIP: keep("THUMB_STRIP", w.second),
    CUFF_BACK: keep("CUFF_BACK", w.second), CUFF_PALM: keep("CUFF_PALM", w.second),
    BINDING: keep("BINDING", w.trim), PIPING: keep("PIPING", w.trim),
    STITCHING: keep("STITCHING", w.trim), LACES: keep("LACES", w.trim === BLACK ? IVORY : w.trim),
  };
}

/* ---- logos and words ---- */
export const TEXT_MAX = 18;
export const GLOVE_FONTS = [
  { id: "block", name: "Block", weight: 800, cssVar: "--nf-display", fallback: '"Barlow Condensed", sans-serif' },
  { id: "plain", name: "Plain", weight: 600, cssVar: "--nf-text", fallback: "Barlow, sans-serif" },
] as const;
export type GloveFontId = (typeof GLOVE_FONTS)[number]["id"];
export const THREAD_COLOURS = [
  { name: "Ivory", hex: IVORY }, { name: "Brass", hex: BRASS }, { name: "Gold", hex: "#d4a93a" }, { name: "Black", hex: BLACK },
  { name: "Fight Red", hex: "#d7331f" }, { name: "Royal Blue", hex: "#1f6fd1" }, { name: "Silver Grey", hex: "#c9cacb" },
] as const;

/** Size is the mark's height as a share of the panel's shorter side; turn is in degrees. Position is in the panel's own 0 to 1 space. */
export const SIZE_MIN = 0.08;
export const SIZE_MAX = 0.9;
interface ArtBase {
  readonly id: string;
  readonly panel: ArtPanelId;
  readonly u: number;
  readonly v: number;
  readonly size: number;
  readonly turn: number;
}
export interface LogoArt extends ArtBase {
  readonly kind: "logo";
  readonly fileName: string;
  /** Width over height of the picture. */
  readonly aspect: number;
}
export interface TextArt extends ArtBase {
  readonly kind: "text";
  readonly text: string;
  readonly font: GloveFontId;
  readonly hex: string;
}
export type GloveArt = LogoArt | TextArt;

/** Where a new mark first lands on each panel: the flattest, most visible part. The back-of-hand panel runs on over the knuckles, so its flat part is below the middle. */
export const ART_START: Readonly<Record<ArtPanelId, { u: number; v: number }>> = {
  HAND_BACK: { u: 0.5, v: 0.7 }, CUFF_BACK: { u: 0.5, v: 0.5 }, PALM: { u: 0.5, v: 0.5 }, THUMB_OUT: { u: 0.5, v: 0.5 }, CUFF_PALM: { u: 0.5, v: 0.5 },
};

export const UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;
export const UPLOAD_MAX_BYTES = 8 * 1024 * 1024;

/** A plain-text record of the design: every panel, then every mark with where it sits. */
export function gloveSpec(panels: GlovePanels, art: readonly GloveArt[]): string {
  const lines = PANELS.map((p) => `${PANEL_NAMES[p]}: ${panels[p].hex.toUpperCase()}${CLOTH_PANELS.includes(p) ? "" : ` ${FINISH_NAMES[panels[p].finish]}`}`);
  const pct = (n: number): string => `${Math.round(n * 100)}%`;
  for (const a of art) {
    const where = `${PANEL_NAMES[a.panel]}, ${pct(a.u)} across, ${pct(a.v)} down, size ${pct(a.size)}, turned ${Math.round(a.turn)}°`;
    lines.push(a.kind === "logo" ? `Logo "${a.fileName}": ${where}` : `Words "${a.text}" (${GLOVE_FONTS.find((f) => f.id === a.font)?.name ?? a.font}, ${a.hex.toUpperCase()}): ${where}`);
  }
  return lines.join("\n");
}
