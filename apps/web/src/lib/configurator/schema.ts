import { z } from "zod";

/**
 * The bag configurator's declarative schema (spec 01, flow A), versioned: an order stores the exact schema version and config it was priced against.
 * Only the heavy bag is live; the other types (banana, teardrop, ...) and bespoke patchwork go to quote and are not built here.
 */
export const SCHEMA_VERSION = "bag@1" as const;

export const COLOURS = [
  { id: "royal-blue", name: "Royal Blue", hex: "#1f4fbf" },
  { id: "fight-red", name: "Fight Red", hex: "#b3141c" },
  { id: "forest-green", name: "Forest Green", hex: "#1d6b3a" },
  { id: "gold", name: "Gold", hex: "#c9a45c" },
  { id: "black", name: "Black", hex: "#141414" },
  { id: "white", name: "White", hex: "#f2efe8" },
] as const;
export type ColourId = (typeof COLOURS)[number]["id"];
const colourIds = COLOURS.map((c) => c.id) as [ColourId, ...ColourId[]];
/** Genuine leather has a limited palette. */
export const LEATHER_COLOURS: readonly ColourId[] = ["black", "fight-red", "white"];
/** Filled bags ship only to these countries (business TODO #14); everywhere else is unfilled, filled on site. */
export const FILLED_COUNTRIES: readonly string[] = ["AU"];
/** Above this quantity the order is a quote (franchise), not a checkout. */
export const QUOTE_ABOVE_QTY = 50;

export const PRESETS = ["plain", "tigerfull", "monogram"] as const;
export type Preset = (typeof PRESETS)[number];

export const BagConfigSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    preset: z.enum(PRESETS),
    type: z.literal("heavy"),
    sizeFt: z.union([z.literal(3), z.literal(4), z.literal(5)]),
    fill: z.enum(["filled", "unfilled"]),
    material: z.enum(["vinyl", "leather", "canvas"]),
    panelLayout: z.enum(["single", "split-vertical", "bands", "three-panel"]),
    bodyColour: z.enum(colourIds),
    accentColour: z.enum(colourIds),
    capColour: z.enum(colourIds),
    bottomColour: z.enum(colourIds),
    piping: z.enum(["none", "contrast"]),
    anchorRing: z.boolean(),
    fillType: z.enum(["shredded", "soft-top"]),
    font: z.enum(["classic", "block", "script", "stencil"]),
    stitching: z.enum(["tonal", "contrast", "accent"]),
    brandingMethod: z.enum(["screen-print", "embroidered-patch", "leather-patch", "debossed"]),
    placement: z.enum(["front", "front-back", "wrap", "top-band", "bottom-band"]),
    logoSize: z.enum(["S", "M", "L", "full"]),
    extraText: z.string().trim().max(30),
    makersMark: z.boolean(),
    hanging: z.enum(["chain-4pt", "heavy-swivel", "strap"]),
    hardware: z.enum(["black", "silver"]),
    quantity: z.number().int().min(1).max(500),
    extras: z.array(z.enum(["qr-tag", "cover", "spare-chain"])).max(3),
    country: z.string().length(2).transform((s) => s.toUpperCase()),
  })
  .strict();
export type BagConfig = z.infer<typeof BagConfigSchema>;

export const DEFAULT_BAG: BagConfig = {
  schemaVersion: SCHEMA_VERSION,
  preset: "plain",
  type: "heavy",
  sizeFt: 4,
  fill: "unfilled",
  material: "vinyl",
  panelLayout: "single",
  bodyColour: "fight-red",
  accentColour: "white",
  capColour: "white",
  bottomColour: "white",
  piping: "none",
  anchorRing: false,
  fillType: "shredded",
  font: "classic",
  stitching: "tonal",
  brandingMethod: "screen-print",
  placement: "front",
  logoSize: "M",
  extraText: "",
  makersMark: true,
  hanging: "chain-4pt",
  hardware: "black",
  quantity: 1,
  extras: [],
  country: "AU",
};

export interface Issue {
  readonly path: string;
  readonly code: string;
  readonly message: string;
  readonly severity: "error" | "info";
}

export interface Validation {
  readonly ok: boolean;
  readonly quote: boolean;
  readonly issues: readonly Issue[];
}

/** The rules engine: what combinations are allowed. Pure and free of three.js, so the server can run exactly what the browser runs. */
export function validateBagConfig(c: BagConfig): Validation {
  const issues: Issue[] = [];
  const err = (path: string, code: string, message: string): void => void issues.push({ path, code, message, severity: "error" });
  if (c.material === "leather") {
    for (const [k, v] of [["bodyColour", c.bodyColour], ["accentColour", c.accentColour], ["capColour", c.capColour]] as const) {
      if (!LEATHER_COLOURS.includes(v)) err(k, "leather_colour", "Genuine leather comes in a limited palette: black, fight red or white.");
    }
  }
  if (c.brandingMethod === "debossed" && c.material !== "leather") err("brandingMethod", "deboss_leather_only", "Debossing is for genuine leather only.");
  if (c.fill === "filled" && !FILLED_COUNTRIES.includes(c.country)) err("fill", "fill_local_only", "Filled bags are only delivered locally; choose unfilled (filled on site) for export.");
  if (c.panelLayout === "single" && c.accentColour !== c.bodyColour && c.preset === "plain") issues.push({ path: "accentColour", code: "accent_unused", message: "The accent colour is only used by split, band and three-panel layouts.", severity: "info" });
  const quote = c.quantity > QUOTE_ABOVE_QTY;
  if (quote) issues.push({ path: "quantity", code: "quote_qty", message: "Orders this size are a quote: we will come back to you.", severity: "info" });
  return { ok: !issues.some((i) => i.severity === "error"), quote, issues };
}
