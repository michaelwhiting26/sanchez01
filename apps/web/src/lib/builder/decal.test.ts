import { describe, expect, it } from "vitest";
import { hitsMark, pictureSize, placeMark, SAFE_MARGIN, turnedExtent } from "./decal";

describe("placing a mark on a panel", () => {
  const W = 1000;
  const H = 500;

  it("leaves a mark that already fits where it was put", () => {
    const p = placeMark(W, H, { u: 0.5, v: 0.5, size: 0.4, turn: 0, aspect: 2 });
    expect(p).toMatchObject({ x: 500, y: 250, h: 200, w: 400, size: 0.4 });
  });

  it("moves a mark back inside the safe area instead of letting it run off the edge", () => {
    const p = placeMark(W, H, { u: 0.99, v: 0.01, size: 0.4, turn: 0, aspect: 2 });
    expect(p.x + p.w / 2).toBeLessThanOrEqual(W * (1 - SAFE_MARGIN) + 1e-6);
    expect(p.y - p.h / 2).toBeGreaterThanOrEqual(H * SAFE_MARGIN - 1e-6);
  });

  it("shrinks a mark that is too wide to fit at all, keeping its shape", () => {
    const p = placeMark(W, H, { u: 0.5, v: 0.5, size: 0.9, turn: 0, aspect: 6 });
    expect(p.w).toBeCloseTo(W * (1 - 2 * SAFE_MARGIN), 5);
    expect(p.w / p.h).toBeCloseTo(6, 5);
    expect(p.size).toBeLessThan(0.9);
  });

  it("allows for the turn when working out the room a mark needs", () => {
    const flat = turnedExtent(400, 100, 0);
    const up = turnedExtent(400, 100, 90);
    expect(flat.ex).toBeCloseTo(200);
    expect(up.ex).toBeCloseTo(50);
    expect(up.ey).toBeCloseTo(200);
    const p = placeMark(W, H, { u: 0.5, v: 0.02, size: 0.3, turn: 90, aspect: 3 });
    expect(p.y - turnedExtent(p.w, p.h, 90).ey).toBeGreaterThanOrEqual(H * SAFE_MARGIN - 1e-6);
  });

  it("knows when a finger is on a turned mark", () => {
    const p = placeMark(W, H, { u: 0.5, v: 0.5, size: 0.2, turn: 90, aspect: 3 });
    expect(hitsMark(p, 90, p.x, p.y + p.w * 0.45)).toBe(true);
    expect(hitsMark(p, 90, p.x + p.w * 0.45, p.y)).toBe(false);
  });

  it("gives a panel a picture of its own shape", () => {
    expect(pictureSize(0.2, 0.1)).toEqual({ W: 1024, H: 512 });
    expect(pictureSize(0.05, 0.2)).toEqual({ W: 256, H: 1024 });
  });
});
