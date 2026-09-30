import { describe, expect, it } from "vitest";
import { TEASE, teaseRise } from "./rise";

describe("teaseRise", () => {
  it("starts at 0 and ends at 1", () => {
    expect(teaseRise(0)).toBe(0);
    expect(teaseRise(1)).toBe(1);
  });
  it("is monotonic, so scrolling back exactly reverses it", () => {
    let prev = -1;
    for (let i = 0; i <= 200; i++) {
      const v = teaseRise(i / 200);
      expect(v).toBeGreaterThanOrEqual(prev - 1e-12);
      prev = v;
    }
  });
  it("lingers on the plateau between the two phases", () => {
    expect(teaseRise(TEASE.A)).toBeCloseTo(TEASE.LO, 6);
    expect(teaseRise(TEASE.B)).toBeCloseTo(TEASE.HI, 6);
    expect(teaseRise(TEASE.B) - teaseRise(TEASE.A)).toBeLessThan(0.05);
  });
});
