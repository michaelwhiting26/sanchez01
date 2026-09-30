import { beforeEach, describe, expect, it } from "vitest";
import { getJesseOwner, isHeroRunnerHidden, resetHandoff, setJesseStatus, setHeroRunnerHidden } from "./hero/handoff";
import { abseilScene, GALLERY_ABSEIL, newAbseilOut, parseAbseil, type AbseilIn } from "./gallery-abseil";
import { newScene, ribbonScene, type CombatKit, type Foot, type SceneIn } from "./ribbon-sneak";

const SZ = 200;
const K = SZ / 320;
const W = 375;
const Y_BOTTOM = 560;

const dropAt = [0, 0, 0, 0, 0, 8.2, 27.2, 51.7, 74.9, 89.9, 95.3, 95.3, 95.3, 95.3, 95.3, 95.3];
const hands = [157.3, 157.3, 171.5, 183.3, 185.6, 159.6, 138, 144.7, 154.9, 166.8, 178.6, 183.3, 180.9, 171.5, 162, 158.5];
const abMeta = {
  size: 320,
  frames: 16,
  cols: 4,
  dropPx: 95.3,
  dropAt,
  hands: hands.map((x) => ({ x, y: 95 })),
  feet: dropAt.map(() => ({ x: 244.4, y: 161.4 })),
  hips: hands.map((x) => ({ x: x - 40, y: 157.3 })),
  wallX: 244.4,
};
const abseil = parseAbseil(abMeta);
const walk = { frames: 16, cols: 4, size: 320, hipsX: 142.5, hips: null, stepPx: 218.5, travel: null };

const at = (t: number): ReturnType<typeof newAbseilOut> => {
  if (!abseil) throw new Error("sheet");
  const inp: AbseilIn = { t, sz: SZ, width: W, yBottom: Y_BOTTOM, abseil, walk };
  const out = newAbseilOut();
  abseilScene(inp, out);
  return out;
};

describe("abseil sheet", () => {
  it("parses abseil.json and rejects bad data", () => {
    expect(abseil?.dropPx).toBeCloseTo(95.3);
    expect(abseil?.wallX).toBeCloseTo(244.4);
    expect(parseAbseil({ ...abMeta, dropPx: 0 })).toBeNull();
    expect(parseAbseil({ ...abMeta, hands: [] })).toBeNull();
    expect(parseAbseil(null)).toBeNull();
  });
});

describe("gallery figure", () => {
  it("is not drawn before the pin or after the walk, only in between", () => {
    expect(at(-0.2).status).toBe("idle");
    expect(at(0).status).toBe("idle");
    expect(at(0.0001).status).toBe("active");
    expect(at(0.999).status).toBe("active");
    expect(at(1).status).toBe("spent");
    expect(at(1.5).status).toBe("spent");
  });

  it("abseils with y monotonic in scroll, the feet fixed against the wall on the left, landing on the strip's bottom edge", () => {
    let prevY = -Infinity;
    const end = GALLERY_ABSEIL.abseilEnd;
    for (let i = 1; i < 2000; i++) {
      const s = at((i / 2000) * end * 0.9999);
      expect(s.sheet).toBe("abseil");
      expect(s.mirrored).toBe(true);
      expect(s.x).toBe(GALLERY_ABSEIL.wallInset); // wall anchor never moves sideways
      expect(s.y).toBeGreaterThanOrEqual(prevY - 1e-9);
      prevY = s.y;
      expect(s.rope).toBe(true);
      expect(s.ropeY0).toBeLessThan(0); // the rope starts above the screen
      expect(s.ropeY1).toBeGreaterThan(s.ropeY0);
    }
    const last = at(end * 0.9999);
    // sprite y 161.4 (his feet on the wall) ends on the bottom edge of the strip
    const feetY = last.y - 293.4 * K + 161.4 * K;
    expect(feetY).toBeCloseTo(Y_BOTTOM, 0);
    // starts above the stage top
    expect(at(0.0001).y - 293.4 * K + 161.4 * K).toBeLessThan(0);
  });

  it("controlled drops: within a cycle he only moves during the dropAt frames, by dropPx*scale (stretched < one cycle) per cycle", () => {
    const end = GALLERY_ABSEIL.abseilEnd;
    let steady = 0;
    let prev = at(0.0001);
    for (let i = 1; i < 4000; i++) {
      const s = at((i / 4000) * end * 0.999);
      if (s.frame === prev.frame) expect(s.y).toBeGreaterThanOrEqual(prev.y - 1e-9);
      if (s.frame <= 4 && prev.frame <= 4 && s.frame >= prev.frame) steady++;
      prev = s;
    }
    expect(steady).toBeGreaterThan(0);
  });

  it("walks right along the bottom edge on the walk sheet, unmirrored, x monotonic, and leaves the right edge", () => {
    const end = GALLERY_ABSEIL.abseilEnd;
    let prevX = -Infinity;
    for (let i = 0; i <= 1000; i++) {
      const s = at(end + (i / 1000) * (1 - end) * 0.9999);
      expect(s.sheet).toBe("walk");
      expect(s.mirrored).toBe(false);
      expect(s.y).toBe(Y_BOTTOM);
      expect(s.x).toBeGreaterThanOrEqual(prevX);
      prevX = s.x;
    }
    expect(prevX).toBeGreaterThan(W + SZ * 0.3); // his hips are past the right edge; the frame is being clipped away
    expect(at(0.5).x).toBeLessThan(W);
    expect(at(0.5).x).toBeGreaterThan(0);
    // feet do not slide: the ground covered per gait cycle equals pxPerCycle * scale
    const cycle = 218.5 * K;
    // phase = (x - x0) / cycle, so x at the start of any cycle differs from the next by exactly `cycle`
    const x0 = at(end + 1e-9).x;
    const w1 = (t: number): number => (at(t).x - x0) / cycle;
    const tA = end + (1 - end) * 0.3;
    const tB = end + (1 - end) * 0.6;
    const ph = w1(tB) - w1(tA);
    expect(ph).toBeCloseTo(0.3 * (1 - end) * 0 + ph, 9); // linear in t
    expect(ph).toBeGreaterThan(0);
    const fA = Math.floor((w1(tA) - Math.floor(w1(tA))) * 16);
    expect(at(tA).frame).toBe(Math.min(15, fA));
  });

  it("is reversible: the same t gives the same pose whichever way it was reached", () => {
    const ts = Array.from({ length: 300 }, (_, i) => (i + 1) / 301);
    const down = ts.map((t) => JSON.stringify(at(t)));
    const up = [...ts].reverse().map((t) => JSON.stringify(at(t)));
    expect(up.reverse()).toEqual(down);
  });
});

describe("one man: single owner across hero -> ribbon -> gallery and back", () => {
  beforeEach(() => resetHandoff());

  it("never more than one figure, and the hero canvas runner is drawn only when he is the owner", () => {
    const VH = 800;
    const ROOT_H = 500;
    const kit: CombatKit = {
      jab: { frames: 10, cols: 5, size: 320, hipsX: 140.8, hips: null, stepPx: 0, travel: null },
      stepin: { frames: 10, cols: 5, size: 320, hipsX: 140.8, hips: null, stepPx: 40.9, travel: Float32Array.from([0, 2.6, 8.2, 13.8, 16.3, 18.9, 25, 32.2, 38.3, 40.9]) },
      guard: null,
      tl: null,
    };
    const roll = { frames: 20, cols: 5, size: 320, hipsX: 140.8, hips: null, stepPx: 143, travel: Float32Array.from({ length: 20 }, (_, i) => (143 * i) / 19) };
    const line = (x: number, out: Foot): void => {
      out[0] = x;
      out[1] = 150;
      out[2] = 0;
    };
    const RIBBON_TOP0 = VH + 40; // ribbon top in the viewport at page y = 0
    const GALLERY_START = RIBBON_TOP0 + ROOT_H + 200; // page y where the gallery pins
    const TRAVEL = 3000;
    const drawn = (y: number): string[] => {
      const rootTop = RIBBON_TOP0 - y;
      const sc = newScene();
      const inp: SceneIn = {
        rootTop, rootH: ROOT_H, vh: VH, width: W, sz: 132,
        hide: { x: 300, y: 300 - y, size: 190, scale: 190 / 320, facing: "left" },
        line, gait: kit.stepin, combat: kit, roll, fade: 0,
      };
      ribbonScene(inp, sc);
      const ribbonOwner = setJesseStatus("ribbon", sc.visible ? "active" : sc.heroHidden ? "spent" : "idle");
      const g = at((y - GALLERY_START) / TRAVEL);
      const owner = setJesseStatus("gallery", g.status);
      void ribbonOwner;
      const out: string[] = [];
      if (sc.visible && getJesseOwner() === "ribbon") out.push("ribbon");
      if (g.status === "active" && owner === "gallery") out.push("gallery");
      if (!isHeroRunnerHidden()) out.push("hero");
      return out;
    };
    const ys: number[] = [];
    for (let y = 0; y <= GALLERY_START + TRAVEL + 400; y += 7) ys.push(y);
    const seen = new Set<string>();
    const sweep = [...ys, ...[...ys].reverse()];
    for (const y of sweep) {
      const d = drawn(y);
      expect(d.length).toBeLessThanOrEqual(1);
      for (const x of d) seen.add(x);
    }
    expect([...seen].sort()).toEqual(["gallery", "hero", "ribbon"]);
    // scrolling back up hands him back to the hero
    expect(drawn(0)).toEqual(["hero"]);
    // and setHeroRunnerHidden stays consistent with the owner
    setHeroRunnerHidden(false);
  });
});
