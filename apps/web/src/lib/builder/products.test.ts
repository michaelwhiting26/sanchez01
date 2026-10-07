import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GLOVE_PRODUCT } from "../gloves/schema";
import { builderSpec, zoneOf, type BuilderArt } from "./product";
import { BUILDER_PRODUCTS } from "./registry";
import { parseSaved } from "./save";
import { STORE_PRODUCTS } from "../storefront/config";

/** Every product the panel builder knows must be whole: the screen trusts these lists and does not check them again. */
describe.each(Object.entries(BUILDER_PRODUCTS))("the %s builder", (slug, product) => {
  it("is filed under its own id", () => {
    expect(product.id).toBe(slug);
  });

  it("puts every panel in exactly one zone", () => {
    expect(product.zones.flatMap((z) => z.parts).sort()).toEqual([...product.panels].sort());
    for (const p of product.panels) expect(zoneOf(product, p).parts).toContain(p);
  });

  it("only links panels that are in the same zone", () => {
    for (const z of product.zones) for (const p of z.linked ?? []) expect(z.parts).toContain(p);
  });

  it("has a name and a starting colour for every panel, and for nothing else", () => {
    expect(Object.keys(product.panelNames).sort()).toEqual([...product.panels].sort());
    expect(Object.keys(product.defaults).sort()).toEqual([...product.panels].sort());
  });

  it("only lets art go on real panels, and knows where each starts", () => {
    for (const p of product.artPanels) {
      expect(product.panels).toContain(p);
      expect(product.artStart[p]).toBeDefined();
    }
    expect(product.artPanels).toContain(product.logoStart.panel);
    expect(product.artPanels).toContain(product.wordsStart.panel);
  });

  it("points the camera only at panels that exist", () => {
    for (const [from, to] of Object.entries(product.faceAs)) {
      expect(product.panels).toContain(from);
      expect(product.panels).toContain(to);
    }
    expect(product.reviewViews).toHaveLength(4);
    for (const p of product.reviewViews) expect(product.panels).toContain(p);
    expect(product.zones.map((z) => z.id)).toContain(product.colourwayZone);
  });

  it("never colours a part that is fixed", () => {
    for (const f of product.fixedNodes) expect(product.panels).not.toContain(f.name);
  });

  it("a colourway sets every panel's colour and leaves each finish alone", () => {
    const first = product.panels[0] as string;
    const glossy = { ...product.defaults, [first]: { hex: "#111316", finish: "gloss" as const } };
    for (const w of product.colourways) {
      const next = w.apply(glossy);
      expect(Object.keys(next).sort()).toEqual([...product.panels].sort());
      expect(next[first]?.finish).toBe("gloss");
      for (const p of product.panels) expect(next[p]?.hex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("reads back a design it saved, and refuses one from a different product", () => {
    const words = [{ id: "1", kind: "text" as const, text: "Whiting", font: "block" as const, hex: "#eeece6", panel: product.wordsStart.panel, u: 0.5, v: 0.5, size: 0.3, turn: 0 }];
    expect(parseSaved(product, JSON.parse(JSON.stringify({ panels: product.defaults, words })))).toEqual({ panels: product.defaults, words });
    expect(parseSaved(product, { panels: { NOT_A_PANEL: { hex: "#111316", finish: "satin" } }, words: [] })).toBeNull();
    expect(parseSaved(product, { panels: product.defaults, words: [{ ...words[0], panel: "NOT_A_PANEL" }] })).toBeNull();
  });
});

describe("the shop wall", () => {
  it("sends each product with a panel builder to that builder", () => {
    for (const slug of Object.keys(BUILDER_PRODUCTS)) expect(STORE_PRODUCTS.find((p) => p.slug === slug)?.builderRoute).toBe(`/build/${slug}`);
  });

  it("gives every product its own place", () => {
    const places = STORE_PRODUCTS.map((p) => p.cameraAnchor);
    expect(new Set(places).size).toBe(places.length);
    expect(STORE_PRODUCTS.map((p) => p.id)).toEqual(["gloves", "heavy-bag", "head-guard", "focus-mitts", "groin-guard"]);
  });

  it("never shows a product whose 3D file is missing", () => {
    for (const p of STORE_PRODUCTS.filter((x) => x.active)) expect(existsSync(new URL(`../../../public${p.modelAsset}`, import.meta.url)), p.modelAsset).toBe(true);
  });
});

describe("the gloves", () => {
  it("keep the eleven panels and the options they launched with", () => {
    expect(GLOVE_PRODUCT.panels).toEqual(["HAND_BACK", "PALM", "THUMB_OUT", "THUMB_IN", "THUMB_STRIP", "CUFF_BACK", "CUFF_PALM", "BINDING", "PIPING", "STITCHING", "LACES"]);
    expect(GLOVE_PRODUCT.artPanels).toEqual(["HAND_BACK", "CUFF_BACK", "PALM", "THUMB_OUT", "CUFF_PALM"]);
    expect(GLOVE_PRODUCT.colourways.map((w) => w.name)).toEqual(["Black & Brass", "Fight Red", "Royal Blue", "Gold & Black", "Ivory & Oxblood", "Midnight"]);
    expect(GLOVE_PRODUCT.zones.map((z) => z.label)).toEqual(["Hand", "Thumb", "Cuff", "Trim"]);
  });

  it("never leave black laces on a black glove", () => {
    const black = GLOVE_PRODUCT.colourways.find((w) => w.name === "Black & Brass");
    expect(black?.apply(GLOVE_PRODUCT.defaults).LACES?.hex).not.toBe("#111316");
  });

  it("write a spec with one line per panel and one per mark", () => {
    const art: BuilderArt[] = [
      { id: "1", kind: "text", text: "Whiting", font: "block", hex: "#eeece6", panel: "CUFF_BACK", u: 0.5, v: 0.25, size: 0.4, turn: 0 },
      { id: "2", kind: "logo", fileName: "gym.png", aspect: 2, panel: "HAND_BACK", u: 0.5, v: 0.5, size: 0.3, turn: 15 },
    ];
    const lines = builderSpec(GLOVE_PRODUCT, GLOVE_PRODUCT.defaults, art).split("\n");
    expect(lines).toHaveLength(GLOVE_PRODUCT.panels.length + 2);
    expect(lines[0]).toBe("Back of hand: #111316 Satin");
    expect(lines).toContain("Laces: #EEECE6");
    expect(lines).toContain('Words "Whiting" (Block, #EEECE6): Cuff, back, 50% across, 25% down, size 40%, turned 0°');
    expect(lines).toContain('Logo "gym.png": Back of hand, 50% across, 50% down, size 30%, turned 15°');
  });
});
