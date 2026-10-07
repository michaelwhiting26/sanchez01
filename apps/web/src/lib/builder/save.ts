import { z } from "zod";
import { FINISHES } from "../configurator/schema";
import { FONTS, SIZE_MAX, SIZE_MIN, TEXT_MAX, type BuilderArt, type BuilderPanels, type BuilderProduct, type TextArt } from "./product";

/**
 * Keeps a design on the visitor's own device between visits: the panel colours and any words, one saved design per product. Uploaded pictures are
 * deliberately not kept. They exist only in the open page, so nothing a visitor uploads is stored anywhere until ordering exists and they choose to send it.
 */
const HEX = z.string().regex(/^#[0-9a-f]{6}$/i);
const Look = z.object({ hex: HEX, finish: z.enum(FINISHES) });
const words = (product: BuilderProduct) =>
  z.object({
    id: z.string().min(1).max(64),
    kind: z.literal("text"),
    text: z.string().max(TEXT_MAX),
    font: z.enum(FONTS.map((f) => f.id) as [TextArt["font"], ...TextArt["font"][]]), // the ids in FONTS, as zod wants them: a non-empty list
    hex: HEX,
    panel: z.string().refine((p) => product.artPanels.includes(p)),
    u: z.number().min(0).max(1),
    v: z.number().min(0).max(1),
    size: z.number().min(SIZE_MIN).max(SIZE_MAX),
    turn: z.number().min(-180).max(180),
  });
export interface SavedDesign {
  panels: BuilderPanels;
  words: TextArt[];
}

/** Reads back a saved design. Anything that does not match the product as it is today (a panel added or renamed since) is dropped and the visitor starts fresh. */
export function parseSaved(product: BuilderProduct, raw: unknown): SavedDesign | null {
  const shape = z.object({ panels: z.record(z.string(), Look), words: z.array(words(product)).max(12) });
  const parsed = shape.safeParse(raw);
  if (!parsed.success) return null;
  const keys = Object.keys(parsed.data.panels);
  if (keys.length !== product.panels.length || !product.panels.every((p) => keys.includes(p))) return null;
  return parsed.data;
}

export function loadDesign(product: BuilderProduct): SavedDesign | null {
  try {
    const raw = window.localStorage.getItem(product.saveKey);
    return raw ? parseSaved(product, JSON.parse(raw)) : null;
  } catch {
    return null; // private mode, or a design saved by an older version: start fresh
  }
}

export function saveDesign(product: BuilderProduct, panels: BuilderPanels, art: readonly BuilderArt[]): void {
  try {
    const kept = art.filter((a): a is TextArt => a.kind === "text");
    window.localStorage.setItem(product.saveKey, JSON.stringify({ panels, words: kept } satisfies SavedDesign));
  } catch {
    // storage is full or switched off: the design simply is not kept
  }
}
