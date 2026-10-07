import { z } from "zod";
import { FINISHES } from "../configurator/schema";
import { ART_PANELS, GLOVE_FONTS, PANELS, SIZE_MAX, SIZE_MIN, TEXT_MAX, type GloveArt, type GlovePanels, type PanelId, type TextArt } from "./schema";

/**
 * Keeps the glove design on the visitor's own device between visits: the panel colours and any words. Uploaded pictures are deliberately not
 * kept. They exist only in the open page, so nothing a visitor uploads is stored anywhere until ordering exists and they choose to send it.
 */
const KEY = "sanchez.glove.v1";
const HEX = z.string().regex(/^#[0-9a-f]{6}$/i);
const Look = z.object({ hex: HEX, finish: z.enum(FINISHES) });
const panelShape = Object.fromEntries(PANELS.map((p) => [p, Look])) as Record<PanelId, typeof Look>; // one entry per panel, built from the list so the two cannot drift
const Words = z.object({
  id: z.string().min(1).max(64),
  kind: z.literal("text"),
  text: z.string().max(TEXT_MAX),
  font: z.enum(GLOVE_FONTS.map((f) => f.id) as [TextArt["font"], ...TextArt["font"][]]), // the ids in GLOVE_FONTS, as zod wants them: a non-empty list
  hex: HEX,
  panel: z.enum(ART_PANELS),
  u: z.number().min(0).max(1),
  v: z.number().min(0).max(1),
  size: z.number().min(SIZE_MIN).max(SIZE_MAX),
  turn: z.number().min(-180).max(180),
});
const Saved = z.object({ panels: z.object(panelShape), words: z.array(Words).max(12) });
export type SavedGlove = z.infer<typeof Saved>;

export function loadGlove(): SavedGlove | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = Saved.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null; // private mode, or a design saved by an older version: start fresh
  }
}

export function saveGlove(panels: GlovePanels, art: readonly GloveArt[]): void {
  try {
    const words = art.filter((a): a is TextArt => a.kind === "text");
    window.localStorage.setItem(KEY, JSON.stringify({ panels, words } satisfies SavedGlove));
  } catch {
    // storage is full or switched off: the design simply is not kept
  }
}
