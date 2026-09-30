import { describe, expect, it } from "vitest";
import { FLAG_MAP, WAVES } from "./config";
import { FlagLookup, quantiseFlag } from "./flag";
import { createWaveTables, fillWaveTables, hash1 } from "./waves";

describe("quantiseFlag", () => {
  it("maps the official navy, red and white to palette indices 0, 1, 2", () => {
    const rgba = [1, 33, 105, 255, 228, 0, 43, 255, 255, 255, 255, 255];
    expect(Array.from(quantiseFlag(rgba, 3))).toEqual([0, 1, 2]);
  });
  it("snaps anti-aliased edge pixels to the nearest colour", () => {
    const rgba = [20, 40, 120, 255, 215, 20, 60, 255, 240, 245, 250, 255];
    expect(Array.from(quantiseFlag(rgba, 3))).toEqual([0, 1, 2]);
  });
});

describe("FlagLookup", () => {
  it("falls back to a plain split before the raster loads", () => {
    const f = new FlagLookup();
    expect(f.at(0.2, 0.2)).toBe(0);
    expect(f.at(0.8, 0.2)).toBe(1);
    expect(f.at(0.8, 0.8)).toBe(2);
  });
  it("reads the right cell and clamps out-of-range positions", () => {
    const f = new FlagLookup();
    const idx = new Uint8Array(FLAG_MAP.width * FLAG_MAP.height).fill(0);
    idx[(FLAG_MAP.height - 1) * FLAG_MAP.width + (FLAG_MAP.width - 1)] = 2; // bottom-right cell
    f.set(idx);
    expect(f.at(1, 1)).toBe(2);
    expect(f.at(5, 5)).toBe(2); // clamped
    expect(f.at(0, 0)).toBe(0);
    expect(f.at(-3, -3)).toBe(0);
  });
});

describe("hash1", () => {
  it("is deterministic and stays in [0, 1)", () => {
    for (let i = -50; i < 200; i += 7) {
      const v = hash1(i * 1.37);
      expect(v).toBe(hash1(i * 1.37));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("fillWaveTables", () => {
  it("is empty before the first set starts and with reduced motion", () => {
    const tables = createWaveTables();
    fillWaveTables(tables, -20, false); // every quarter's offset is under 10s, so all are still waiting
    expect(tables.every((t) => t.every((v) => v === 0))).toBe(true);
    fillWaveTables(tables, 30, true);
    expect(tables.every((t) => t.every((v) => v === 0))).toBe(true);
  });
  it("produces crests once a set is under way, and never negative values", () => {
    const tables = createWaveTables();
    fillWaveTables(tables, 4, false);
    expect(tables.some((t) => t.some((v) => v > 0))).toBe(true);
    expect(tables.every((t) => t.every((v) => v >= 0))).toBe(true);
    expect(tables.every((t) => t.length === WAVES.bins + 1)).toBe(true);
  });
  it("gives each quarter its own timing: the four tables differ", () => {
    const tables = createWaveTables();
    fillWaveTables(tables, 30, false);
    const key = (t: Float32Array): string => Array.from(t, (v) => v.toFixed(3)).join(",");
    expect(new Set(tables.map(key)).size).toBe(4);
  });
  it("is deterministic", () => {
    const a = createWaveTables();
    const b = createWaveTables();
    fillWaveTables(a, 12.5, false);
    fillWaveTables(b, 12.5, false);
    expect(a.map((t) => Array.from(t))).toEqual(b.map((t) => Array.from(t)));
  });
});
