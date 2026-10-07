import { describe, expect, it } from "vitest";
import { ART_PANELS, DEFAULT_PANELS, GLOVE_COLOURWAYS, GLOVE_ZONES, PANELS, applyColourway, gloveSpec, isArtPanel, zoneOfPanel, type GloveArt } from "./schema";

describe("the glove's panels", () => {
  it("puts every panel in exactly one zone", () => {
    const inZones = GLOVE_ZONES.flatMap((z) => z.parts);
    expect([...inZones].sort()).toEqual([...PANELS].sort());
    for (const p of PANELS) expect(zoneOfPanel(p).parts).toContain(p);
  });

  it("only links panels that are in the same zone", () => {
    for (const z of GLOVE_ZONES) for (const p of z.linked ?? []) expect(z.parts).toContain(p);
  });

  it("only lets art go on real panels", () => {
    for (const p of ART_PANELS) expect(PANELS).toContain(p);
    expect(isArtPanel("PIPING")).toBe(false);
  });

  it("a colourway sets every panel's colour and leaves each finish alone", () => {
    const glossy = { ...DEFAULT_PANELS, HAND_BACK: { hex: "#111316", finish: "gloss" as const } };
    for (const w of GLOVE_COLOURWAYS) {
      const next = applyColourway(glossy, w);
      expect(Object.keys(next).sort()).toEqual([...PANELS].sort());
      expect(next.HAND_BACK).toEqual({ hex: w.hand, finish: "gloss" });
      expect(next.PALM.hex).toBe(w.second);
      expect(next.PIPING.hex).toBe(w.trim);
    }
  });

  it("never leaves black laces on a black glove", () => {
    const next = applyColourway(DEFAULT_PANELS, { name: "t", hand: "#111316", second: "#111316", trim: "#111316" });
    expect(next.LACES.hex).not.toBe("#111316");
  });

  it("writes a spec with one line per panel and one per mark", () => {
    const art: GloveArt[] = [
      { id: "1", kind: "text", text: "Whiting", font: "block", hex: "#eeece6", panel: "CUFF_BACK", u: 0.5, v: 0.25, size: 0.4, turn: 0 },
      { id: "2", kind: "logo", fileName: "gym.png", aspect: 2, panel: "HAND_BACK", u: 0.5, v: 0.5, size: 0.3, turn: 15 },
    ];
    const lines = gloveSpec(DEFAULT_PANELS, art).split("\n");
    expect(lines).toHaveLength(PANELS.length + 2);
    expect(lines[0]).toBe("Back of hand: #111316 Satin");
    expect(lines).toContain("Laces: #EEECE6");
    expect(lines).toContain('Words "Whiting" (Block, #EEECE6): Cuff, back, 50% across, 25% down, size 40%, turned 0°');
    expect(lines).toContain('Logo "gym.png": Back of hand, 50% across, 50% down, size 30%, turned 15°');
  });
});
