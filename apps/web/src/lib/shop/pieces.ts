import { GLOVE_PRODUCT } from "@/lib/gloves/schema";
import { HEADGUARD_PRODUCT } from "@/lib/headguard/schema";
import { GROINGUARD_PRODUCT } from "@/lib/groinguard/schema";
import { PART_PALETTE } from "@/lib/configurator/schema";
import type { BuilderProduct } from "@/lib/builder/product";

/**
 * The tick-box choices on each product's order page (/piece/[slug], owner, 15 Oct 2026). Every option comes from the 3D builders'
 * own lists (colourways, the part palette, the heavy bag's sizes, fill and material), so the order page never offers something the
 * builder does not. Plain data only: the page passes it to the client form.
 */
export interface Colourway {
  readonly name: string;
  readonly swatch: readonly [string, string];
}
export interface TickGroup {
  readonly id: string;
  readonly label: string;
  readonly options: readonly string[];
}
export interface PieceOptions {
  readonly colourways: readonly Colourway[];
  readonly palette: ReadonlyArray<{ readonly name: string; readonly hex: string }>;
  readonly extras: readonly TickGroup[];
}

const ways = (p: BuilderProduct): Colourway[] => p.colourways.map((c) => ({ name: c.name, swatch: [c.swatch[0], c.swatch[1]] }));
const palette = PART_PALETTE.map((c) => ({ name: c.name, hex: c.hex }));

const BY_SLUG: Readonly<Record<string, PieceOptions>> = {
  gloves: { colourways: ways(GLOVE_PRODUCT), palette, extras: [] },
  "head-guard": { colourways: ways(HEADGUARD_PRODUCT), palette, extras: [] },
  "groin-guard": { colourways: ways(GROINGUARD_PRODUCT), palette, extras: [] },
  "heavy-bag": {
    colourways: [],
    palette,
    // the heavy bag builder's own choices (lib/configurator/schema.ts BagConfigSchema)
    extras: [
      { id: "size", label: "Size", options: ["3 ft", "4 ft", "5 ft"] },
      { id: "fill", label: "Fill", options: ["Filled", "Unfilled"] },
      { id: "material", label: "Material", options: ["Vinyl", "Leather", "Canvas"] },
    ],
  },
  "focus-mitts": { colourways: [], palette, extras: [] },
};

export function pieceOptions(slug: string): PieceOptions {
  return BY_SLUG[slug] ?? { colourways: [], palette, extras: [] };
}
