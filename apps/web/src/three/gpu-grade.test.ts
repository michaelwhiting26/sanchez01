import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { GPU_BENCHMARKS_URL, startingQuality } from "./gpu-grade";

describe("startingQuality", () => {
  it("starts reduced on a chip the tables name as slow", () => {
    expect(startingQuality({ type: "BENCHMARK", tier: 1 })).toBe(1);
    expect(startingQuality({ type: "BENCHMARK", tier: 0 })).toBe(1);
    expect(startingQuality({ type: "BLOCKLISTED", tier: 0 })).toBe(1);
  });
  it("starts full on a chip the tables name as capable", () => {
    expect(startingQuality({ type: "BENCHMARK", tier: 2 })).toBe(0);
    expect(startingQuality({ type: "BENCHMARK", tier: 3 })).toBe(0);
  });
  it("starts full when the chip could not be identified, whatever tier was guessed", () => {
    expect(startingQuality({ type: "FALLBACK", tier: 1 })).toBe(0);
    expect(startingQuality({ type: "FALLBACK", tier: 0 })).toBe(0);
  });
});

describe("the served benchmark tables", () => {
  it("match the installed detect-gpu package, file for file", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const served = join(here, "../../public", GPU_BENCHMARKS_URL);
    const installed = join(dirname(createRequire(import.meta.url).resolve("detect-gpu")), "benchmarks");
    const names = readdirSync(installed).filter((n) => n.endsWith(".json")).sort();
    expect(readdirSync(served).sort()).toEqual(names);
    for (const name of names) expect(readFileSync(join(served, name), "utf8"), name).toBe(readFileSync(join(installed, name), "utf8"));
  });
});
