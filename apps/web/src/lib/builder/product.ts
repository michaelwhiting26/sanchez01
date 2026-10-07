import { FINISHES, PART_PALETTE, type Finish } from "../configurator/schema";

/**
 * What the panel builder needs to know about a product. The builder itself (components/build/PanelBuilder.tsx) is the same for every product:
 * colour each panel, add logos, add words, review. A product is a 3D file cut into named panels plus the lists below. The node names are the
 * contract with the script that makes the model.
 * Evidence rule: nothing here states a price, a weight or a leather grade, because none is confirmed.
 */
export interface PanelLook {
  readonly hex: string;
  readonly finish: Finish;
}
export type BuilderPanels = Readonly<Record<string, PanelLook>>;

export interface BuilderZone {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly parts: readonly string[];
  /** Parts that take the same colour until the visitor asks to edit each. */
  readonly linked?: readonly string[];
  readonly linkedName?: string;
}

export interface BuilderColourway {
  readonly name: string;
  /** The two colours shown on its button. */
  readonly swatch: readonly [string, string];
  /** Sets every panel's colour; each panel keeps its finish. */
  readonly apply: (panels: BuilderPanels) => BuilderPanels;
}

export interface BuilderProduct {
  readonly id: string;
  /** The words on screen. */
  readonly copy: {
    readonly heading: string;
    readonly priceLabel: string;
    readonly reviewTitle: string;
    /** "glove", "head guard": used in "Tap the glove to place it". */
    readonly noun: string;
    readonly standIn: string;
    readonly reviewNote: string;
  };
  readonly saveKey: string;
  readonly fileStem: string;
  readonly assets: { readonly model: string; readonly meta: string; readonly shading: string; readonly grain: string };
  /** Every panel the visitor can colour, in the order the review lists them. */
  readonly panels: readonly string[];
  readonly panelNames: Readonly<Record<string, string>>;
  /** Drawn but never coloured by the visitor. */
  readonly fixedNodes: ReadonlyArray<{ readonly name: string; readonly hex: string }>;
  /** Thread and lace: they take a colour but not a leather finish. */
  readonly clothPanels: readonly string[];
  /** Panels large and flat enough to carry a logo or words. */
  readonly artPanels: readonly string[];
  /** Where a new mark first lands on each art panel: its flattest, most visible part. */
  readonly artStart: Readonly<Record<string, { readonly u: number; readonly v: number }>>;
  readonly logoStart: { readonly panel: string; readonly size: number };
  readonly wordsStart: { readonly panel: string; readonly size: number };
  readonly zones: readonly BuilderZone[];
  /** The zone whose tab also offers the colourways. */
  readonly colourwayZone: string;
  readonly defaults: BuilderPanels;
  readonly colourways: readonly BuilderColourway[];
  /** For parts that are not one flat panel: the panel whose direction the camera borrows. */
  readonly faceAs: Readonly<Record<string, string>>;
  /** The four review pictures, each named by the panel the camera faces. */
  readonly reviewViews: readonly string[];
  /** How much room the model needs on screen, as shares of its height (taller = further away). */
  readonly fit: { readonly tall: number; readonly wide: number };
}

export const zoneOf = (product: BuilderProduct, panel: string): BuilderZone => product.zones.find((z) => z.parts.includes(panel)) ?? (product.zones[0] as BuilderZone);

export const PALETTE = PART_PALETTE;
export const FINISH_LIST = FINISHES;
export const FINISH_NAMES: Readonly<Record<Finish, string>> = { gloss: "Gloss", satin: "Satin", matte: "Matte", metallic: "Metallic" };

/** What a finish does to the leather: the same four finishes as the bag, so every builder agrees. */
export const FINISH_RECIPE: Readonly<Record<Finish, { roughness: number; metalness: number; clearcoat: number; clearcoatRoughness: number }>> = {
  gloss: { roughness: 0.3, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.18 },
  satin: { roughness: 0.5, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.4 },
  matte: { roughness: 0.86, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.4 },
  metallic: { roughness: 0.34, metalness: 0.7, clearcoat: 0.4, clearcoatRoughness: 0.4 },
};

export const BLACK = "#111316";
export const IVORY = "#eeece6";
export const BRASS = "#c8954d";
export const look = (hex: string, finish: Finish = "satin"): PanelLook => ({ hex, finish });

/* ---- logos and words ---- */
export const TEXT_MAX = 18;
export const FONTS = [
  { id: "block", name: "Block", weight: 800, cssVar: "--nf-display", fallback: '"Barlow Condensed", sans-serif' },
  { id: "plain", name: "Plain", weight: 600, cssVar: "--nf-text", fallback: "Barlow, sans-serif" },
] as const;
export type FontId = (typeof FONTS)[number]["id"];
export const THREAD_COLOURS = [
  { name: "Ivory", hex: IVORY }, { name: "Brass", hex: BRASS }, { name: "Gold", hex: "#d4a93a" }, { name: "Black", hex: BLACK },
  { name: "Fight Red", hex: "#d7331f" }, { name: "Royal Blue", hex: "#1f6fd1" }, { name: "Silver Grey", hex: "#c9cacb" },
] as const;

/** Size is the mark's height as a share of the panel's shorter side; turn is in degrees. Position is in the panel's own 0 to 1 space. */
export const SIZE_MIN = 0.08;
export const SIZE_MAX = 0.9;
interface ArtBase {
  readonly id: string;
  readonly panel: string;
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
  readonly font: FontId;
  readonly hex: string;
}
export type BuilderArt = LogoArt | TextArt;

export const UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;
export const UPLOAD_MAX_BYTES = 8 * 1024 * 1024;

/** A plain-text record of the design: every panel, then every mark with where it sits. */
export function builderSpec(product: BuilderProduct, panels: BuilderPanels, art: readonly BuilderArt[]): string {
  const name = (p: string): string => product.panelNames[p] ?? p;
  const lines = product.panels.map((p) => `${name(p)}: ${(panels[p]?.hex ?? "").toUpperCase()}${product.clothPanels.includes(p) || !panels[p] ? "" : ` ${FINISH_NAMES[panels[p].finish]}`}`);
  const pct = (n: number): string => `${Math.round(n * 100)}%`;
  for (const a of art) {
    const where = `${name(a.panel)}, ${pct(a.u)} across, ${pct(a.v)} down, size ${pct(a.size)}, turned ${Math.round(a.turn)}°`;
    lines.push(a.kind === "logo" ? `Logo "${a.fileName}": ${where}` : `Words "${a.text}" (${FONTS.find((f) => f.id === a.font)?.name ?? a.font}, ${a.hex.toUpperCase()}): ${where}`);
  }
  return lines.join("\n");
}
