import { describe, expect, it } from "vitest";
import { findCurrentViseme, updateLipSync } from "./lip-sync";

const V = [
  { t: 0.14, shape: "AA", weight: 0.72 },
  { t: 0.22, shape: "M", weight: 0.81 },
];

describe("lip sync", () => {
  it("rests before the first sound", () => expect(findCurrentViseme(0.05, V)).toBeNull());
  it("uses the latest viseme that has started", () => expect(findCurrentViseme(0.23, V)?.shape).toBe("M"));
  it("fades a viseme out and then rests", () => {
    expect(findCurrentViseme(0.2, V)?.weight).toBeLessThan(0.72);
    expect(findCurrentViseme(0.6, V)).toBeNull();
  });
  it("drives the face", () => {
    const calls: string[] = [];
    updateLipSync(0.22, V, { setMorph: (s) => calls.push(s), resetMouth: () => calls.push("reset") });
    expect(calls).toEqual(["reset", "M"]);
  });
});
