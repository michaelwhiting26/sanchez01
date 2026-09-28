import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** The rules engine must run without three.js (CLAUDE.md "3D"). */
describe("config3d dependency boundary", () => {
  const root = join(import.meta.dirname, "..");
  const files = readdirSync(join(root, "src"), { recursive: true, encoding: "utf8" }).filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
  );

  it.each(files)("%s imports no three.js / R3F / DOM-only code", (f) => {
    const src = readFileSync(join(root, "src", f), "utf8");
    expect(src).not.toMatch(/from\s+["'](three|@react-three\/[^"']+|react)["']/);
    expect(src).not.toMatch(/from\s+["']node:/);
  });

  it("declares no three.js dependency", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };
    expect(Object.keys(pkg.dependencies ?? {}).filter((d) => /three/.test(d))).toEqual([]);
  });
});
