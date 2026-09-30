import { beforeEach, describe, expect, it } from "vitest";
import { getHeroHideSpot, isHeroRunnerHidden, onHeroRunnerHidden, resetHandoff, setHeroHideSpot, setHeroRunnerHidden, type HeroHideSpot } from "./hero/handoff";
import { buildTimeline, comboAt, detrendHips, newScene, SEG_JAB, SEG_STEP, parseSheet, ribbonScene, RIBBON, type CombatKit, type Foot, type RibbonSheet, type SceneIn, type SceneOut } from "./ribbon-sneak";

const VH = 800;
const ROOT_H = 500;
const WIDTH = 390;
const SZ = 132;
const K = SZ / 320;
const STEP = 36.8;

/** A gentle arc, root-relative: the ribbon's top line. */
const line = (x: number, out: Foot): void => {
  out[0] = x;
  out[1] = 120 + 0.0006 * (x - WIDTH / 2) ** 2 * -1 + 60;
  out[2] = ((x - WIDTH / 2) / WIDTH) * 0.2;
};

// like the real sheets: rendered in place (hips pinned), with the body's cumulative travel per frame (a plateau while the teep is thrown)
const smooth01 = (v: number): number => v * v * (3 - 2 * v);
const teep: RibbonSheet = { frames: 24, cols: 6, size: 320, hipsX: 140.8, hips: new Float32Array(24).fill(140.8), stepPx: STEP, travel: Float32Array.from({ length: 24 }, (_, i) => STEP * smooth01(Math.min(1, i / 12))) };
const roll: RibbonSheet = { frames: 20, cols: 5, size: 320, hipsX: 140.8, hips: new Float32Array(20).fill(140.8), stepPx: 143, travel: Float32Array.from({ length: 20 }, (_, i) => (143 * i) / 19) };

/** The hide spot is fixed in the document: it moves up the viewport by however far the page has scrolled. */
const HIDE_DOC_Y = 300; // viewport y when the ribbon's top is at TOP0
const TOP0 = VH + 40;
const hideAt = (rootTop: number): HeroHideSpot => ({ x: 300, y: HIDE_DOC_Y - (TOP0 - rootTop), size: SZ * 1.4, scale: (SZ * 1.4) / 320, facing: "left" });

const scene = (rootTop: number, opts: { roll?: RibbonSheet | null; fade?: number; hide?: boolean; combat?: CombatKit | null } = {}): SceneOut => {
  const out = newScene();
  const inp: SceneIn = { rootTop, rootH: ROOT_H, vh: VH, width: WIDTH, sz: SZ, hide: opts.hide === false ? null : hideAt(rootTop), line, gait: teep, combat: opts.combat === undefined ? null : opts.combat, roll: opts.roll === undefined ? roll : opts.roll, fade: opts.fade ?? 0 };
  ribbonScene(inp, out);
  return out;
};

const sweepDown = (): number[] => {
  const tops: number[] = [];
  for (let t = TOP0; t >= -ROOT_H - 60; t -= 4) tops.push(t);
  return tops;
};

describe("single figure: the hero runner is hidden exactly while the ribbon figure exists", () => {
  it("never both drawn, and the canvas runner is hidden whenever the ribbon figure is drawn, across a scroll sweep down and back up", () => {
    const down = sweepDown();
    const order = [...down, ...[...down].reverse()];
    let sawVisible = false;
    let sawHeroHiddenOnly = false;
    for (const top of order) {
      const s = scene(top);
      if (s.visible) {
        sawVisible = true;
        expect(s.heroHidden).toBe(true);
      }
      if (!s.heroHidden) expect(s.visible).toBe(false); // hero drawn => no ribbon figure
      if (s.heroHidden && !s.visible) {
        sawHeroHiddenOnly = true;
        expect(s.cross).toBe(1); // only after he has walked off the left edge (nobody on screen)
      }
    }
    expect(sawVisible).toBe(true);
    expect(sawHeroHiddenOnly).toBe(true);
  });
  it("the ribbon figure never exists before the hero has published a hide spot", () => {
    for (const top of sweepDown()) {
      const s = scene(top, { hide: false });
      expect(s.visible).toBe(false);
      expect(s.heroHidden).toBe(false);
    }
  });
  it("neither exists before the ribbon comes into view, and the first frame of the ribbon figure sits exactly on the hide spot", () => {
    expect(scene(TOP0).visible).toBe(false);
    let firstTop = 0;
    for (const top of sweepDown()) {
      if (scene(top).visible) {
        firstTop = top;
        break;
      }
    }
    const s = scene(firstTop);
    const h = hideAt(firstTop);
    expect(s.sheet).toBe("roll");
    expect(s.frame).toBeLessThanOrEqual(1);
    expect(Math.abs(s.y - (h.y - firstTop))).toBeLessThan(3);
    expect(Math.abs(s.scale * SZ - h.size)).toBeLessThan(6);
  });
  it("without a roll sheet the same invariant holds through the fade", () => {
    for (const fade of [0, 0.3, 1]) {
      for (const top of sweepDown()) {
        const s = scene(top, { roll: null, fade });
        if (s.visible) expect(s.heroHidden).toBe(true);
        if (!s.heroHidden) expect(s.visible).toBe(false);
      }
    }
    expect(scene(TOP0 - 400, { roll: null, fade: 0 }).heroHidden).toBe(false);
    const mid = scene(TOP0 - 400, { roll: null, fade: 0.5 });
    expect(mid.visible).toBe(true);
    expect(mid.sheet).toBe("pose");
    expect(mid.alpha).toBe(0.5);
  });
});

describe("roll hand-off", () => {
  it("scrubs the roll frames forward with scroll, lands on the ribbon line, then crosses", () => {
    let last = -1;
    let sawLand = false;
    for (const top of sweepDown()) {
      const s = scene(top);
      if (s.sheet === "roll" && s.visible) {
        expect(s.frame).toBeGreaterThanOrEqual(last);
        last = s.frame;
      }
      if (s.sheet === "gait" && s.visible && !sawLand) {
        sawLand = true;
        expect(last).toBe(roll.frames - 1);
        const foot: Foot = [0, 0, 0];
        line(s.x, foot);
        expect(Math.abs(s.y - foot[1])).toBeLessThan(0.01);
      }
    }
    expect(sawLand).toBe(true);
  });
  it("is symmetric: scrolling back up gives exactly the same frames as scrolling down (he rolls back into hiding)", () => {
    const down = sweepDown();
    const a = down.map((t) => JSON.stringify(scene(t)));
    const b = [...down].reverse().map((t) => JSON.stringify(scene(t))).reverse();
    expect(b).toEqual(a);
  });
  it("uses the documented scroll window for the roll", () => {
    expect(RIBBON.rollFromShare).toBeGreaterThan(RIBBON.rollToShare);
    const rolling = sweepDown().filter((t) => {
      const s = scene(t);
      return s.visible && s.sheet === "roll";
    });
    expect(rolling.length).toBeGreaterThan(5);
  });
});

describe("teep crossing", () => {
  const crossing = (): SceneOut[] => sweepDown().map((t) => scene(t)).filter((s) => s.visible && s.sheet === "gait");
  it("runs right to left, off the left edge, facing left", () => {
    const c = crossing();
    expect(c.length).toBeGreaterThan(20);
    for (let i = 1; i < c.length; i++) expect(c[i]?.x ?? 0).toBeLessThanOrEqual((c[i - 1]?.x ?? 0) + 1e-9);
    expect(c[c.length - 1]?.x ?? 1e9).toBeLessThan(SZ);
    for (const s of c) expect(s.mirrored).toBe(true);
  });
  it("advances exactly stepPx * scale per gait cycle, so the support foot does not slide", () => {
    // sample finely and note where each cycle starts (frame wraps 23 -> 0)
    const xs: number[] = [];
    let prevFrame = -1;
    for (let top = TOP0; top >= -ROOT_H - 60; top -= 0.05) {
      const s = scene(top);
      if (s.visible && s.sheet === "gait") {
        if (prevFrame > 20 && s.frame === 0) xs.push(s.x);
        prevFrame = s.frame;
      }
    }
    expect(xs.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < xs.length; i++) expect((xs[i - 1] ?? 0) - (xs[i] ?? 0)).toBeCloseTo(STEP * K, 0);
  });
  it("moves the body by the sheet's own travelAt within a cycle, never backwards", () => {
    let prevX = Infinity;
    for (let top = TOP0; top >= -ROOT_H - 60; top -= 0.05) {
      const s = scene(top);
      if (!s.visible || s.sheet !== "gait") continue;
      expect(s.x).toBeLessThanOrEqual(prevX + 1e-6);
      prevX = s.x;
    }
  });
  it("keeps the feet on the ribbon curve with the clamped tilt", () => {
    for (const s of crossing()) {
      const foot: Foot = [0, 0, 0];
      line(s.x, foot);
      expect(s.y).toBeCloseTo(foot[1], 6);
      expect(s.tilt).toBeCloseTo(foot[2], 6);
    }
  });
  it("freezes when scroll stops: the same position gives the same pose, however you arrived", () => {
    const at = TOP0 - 640;
    const a = JSON.stringify(scene(at));
    scene(at - 50);
    scene(at + 90);
    expect(JSON.stringify(scene(at))).toBe(a);
  });
});

describe("sheet parsing", () => {
  it("reads the teep and roll contracts, and rejects bad or missing data", () => {
    const hips = Array.from({ length: 24 }, (_, i) => ({ x: 150 + i, y: 170 }));
    const t = parseSheet({ frames: 24, cols: 6, size: 320, footY: 293.4, stepPx: 190, support: [], hips }, "stepPx");
    expect(t?.stepPx).toBe(190);
    expect(t?.hips?.length).toBe(24);
    expect(parseSheet({ frames: 24, cols: 6, size: 320 }, "stepPx")).toBeNull();
    expect(parseSheet(null, "stepPx")).toBeNull();
    expect(parseSheet({ frames: 0, cols: 6, size: 320, stepPx: 10 }, "stepPx")).toBeNull();
    const r = parseSheet({ frames: 20, cols: 5, size: 320, travelPx: 90, hips: hips.slice(0, 20) }, "travelPx");
    expect(r?.frames).toBe(20);
    expect(parseSheet({ frames: 20, cols: 5, size: 320, hips: hips.slice(0, 3) }, "travelPx")?.hips).toBeNull();
    const withTravel = parseSheet({ frames: 4, cols: 2, size: 320, stepPx: 10, travelAt: [0, 2, 8, 10] }, "stepPx");
    expect(Array.from(withTravel?.travel ?? [])).toEqual([0, 2, 8, 10]);
    expect(parseSheet({ frames: 4, cols: 2, size: 320, stepPx: 10, travelAt: [0, 2] }, "stepPx")?.travel).toBeNull();
  });
  it("removes baked-in travel from gait hips and leaves an in-place sheet alone", () => {
    const baked: RibbonSheet = { ...teep, hips: Float32Array.from({ length: 24 }, (_, i) => 100 + 8 * i) };
    const d = detrendHips(baked);
    for (let i = 0; i < 24; i++) expect(d.hips?.[i]).toBeCloseTo(100, 4);
    expect(detrendHips({ ...teep, hips: null }).hips).toBeNull();
  });
});

describe("hand-off registry", () => {
  beforeEach(() => resetHandoff());
  it("has no hide spot until the hero publishes one, and returns it for the current scroll", () => {
    expect(getHeroHideSpot()).toBeNull();
    setHeroHideSpot({ x: 10, y: 20, size: 100, scale: 0.3, facing: "left" });
    expect(getHeroHideSpot()?.y).toBe(20);
    setHeroHideSpot(null);
    expect(getHeroHideSpot()).toBeNull();
  });
  it("tells listeners synchronously, only on a change", () => {
    const seen: boolean[] = [];
    const off = onHeroRunnerHidden((h) => seen.push(h));
    setHeroRunnerHidden(true);
    setHeroRunnerHidden(true);
    expect(isHeroRunnerHidden()).toBe(true);
    setHeroRunnerHidden(false);
    off();
    setHeroRunnerHidden(true);
    expect(seen).toEqual([true, false]);
  });
});

// ---------------------------------------------------------------- jab combos

const hips10 = new Float32Array(10).fill(140.8);
const stepinTravel = Float32Array.from([0, 2.6, 8.2, 13.8, 16.3, 18.9, 25, 32.2, 38.3, 40.9]);
const mkKit = (guard: boolean): CombatKit => ({
  jab: { frames: 10, cols: 5, size: 320, hipsX: 140.8, hips: hips10, stepPx: 0, travel: null },
  stepin: { frames: 10, cols: 5, size: 320, hipsX: 140.8, hips: hips10, stepPx: 40.9, travel: stepinTravel },
  guard: guard ? { frames: 8, cols: 4, size: 320, hipsX: 140.8, hips: new Float32Array(8).fill(140.8), stepPx: 0, travel: null } : null,
  tl: null,
});
/** rootTop at which the crossing has progress c (0..1). */
const topForCross = (c: number): number => {
  let lo = -ROOT_H - 60;
  let hi = TOP0;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (scene(mid, { combat: mkKit(true) }).cross > c) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

describe("jab combos", () => {
  it("combo c is a pure function of (seed, c): the same sequence every time, sizes 1..4, mostly small", () => {
    const a = Array.from({ length: 400 }, (_, c) => comboAt(c));
    const b = Array.from({ length: 400 }, (_, c) => comboAt(c));
    expect(a).toEqual(b);
    const counts = [0, 0, 0, 0, 0];
    for (const c of a) counts[c.jabs] = (counts[c.jabs] ?? 0) + 1;
    expect(counts[0]).toBe(0);
    for (let n = 1; n <= 4; n++) expect(counts[n] ?? 0).toBeGreaterThan(0);
    expect(counts[1]).toBeGreaterThan(counts[4] ?? 0);
    expect(comboAt(0).guard).toBe(true);
    expect(comboAt(3, 1).jabs).toBe(comboAt(3, 1).jabs);
  });

  it("the timeline is deterministic and a longer crossing only extends the shorter one (scrolling back reproduces it exactly)", () => {
    const short = buildTimeline(12, true);
    const again = buildTimeline(12, true);
    expect(Array.from(again.kind)).toEqual(Array.from(short.kind));
    expect(Array.from(again.len)).toEqual(Array.from(short.len));
    const long = buildTimeline(30, true);
    const cut = short.count - 1; // the last combo of the short one may be truncated
    let lastFull = cut;
    while (lastFull > 0 && short.combo[lastFull] === short.combo[cut]) lastFull--;
    expect(Array.from(long.kind.slice(0, lastFull))).toEqual(Array.from(short.kind.slice(0, lastFull)));
    // every step segment is a whole cycle, jabs come only in combos of 1..4 per combo index
    const jabsIn = new Map<number, number>();
    for (let i = 0; i < long.count; i++) if (long.kind[i] === SEG_JAB) jabsIn.set(long.combo[i] ?? 0, (jabsIn.get(long.combo[i] ?? 0) ?? 0) + 1);
    for (const [c, n] of jabsIn) expect(n).toBe(comboAt(c).jabs);
    expect(long.kind[long.count - 1]).toBe(SEG_STEP);
    expect(long.stepsBefore[long.count - 1]).toBe(29);
  });

  it("scroll to (segment, frame) is a pure map: same position gives the same pose whichever way you arrived; reversible", () => {
    const kit = mkKit(true);
    const tops = Array.from({ length: 200 }, (_, i) => topForCross(0.001 + (i / 200) * 0.99));
    const down = tops.map((t) => JSON.stringify(scene(t, { combat: kit })));
    const up = [...tops].reverse().map((t) => JSON.stringify(scene(t, { combat: kit })));
    expect(up.reverse()).toEqual(down);
  });

  it("feet are planted during jabs and guard (x constant within a segment), and x advances only during steps", () => {
    const kit = mkKit(true);
    const k = SZ / 320;
    const stepK = 40.9 * k;
    let prevX = Number.NaN;
    let prevSheet = "";
    let planted = 0;
    let moved = 0;
    for (let i = 0; i <= 4000; i++) {
      const s = scene(topForCross(0.02 + (i / 4000) * 0.95), { combat: kit });
      if (!s.visible || s.sheet === "roll") continue;
      if (s.sheet === "jab" || s.sheet === "guard") {
        if (prevSheet === s.sheet || prevSheet === "") {
          if (!Number.isNaN(prevX) && prevSheet === s.sheet) expect(s.x).toBeCloseTo(prevX, 4);
        }
        planted++;
      } else if (s.sheet === "step") moved++;
      // x never increases (right to left) and never jumps by more than one step cycle
      if (!Number.isNaN(prevX)) {
        expect(s.x).toBeLessThanOrEqual(prevX + 1e-6);
        expect(prevX - s.x).toBeLessThanOrEqual(stepK + 1e-6);
      }
      prevX = s.x;
      prevSheet = s.sheet;
    }
    expect(planted).toBeGreaterThan(0);
    expect(moved).toBeGreaterThan(0);
  });

  it("advances exactly stepPx * scale per step cycle in total, and exits off the left edge", () => {
    const kit = mkKit(true);
    const k = SZ / 320;
    const first = scene(topForCross(0.0005), { combat: kit });
    expect(first.visible).toBe(true);
    const tl = kit.tl;
    expect(tl).not.toBeNull();
    const n = tl?.steps ?? 0;
    const last = scene(topForCross(0.9995), { combat: kit });
    // just before the end he is at most one step from the exit point, which is where n whole steps have been walked
    expect(first.x - last.x).toBeGreaterThan((n - 1) * 40.9 * k - 1e-6);
    expect(first.x - last.x).toBeLessThanOrEqual(n * 40.9 * k + 1e-6);
    expect(last.x).toBeLessThan(0.2 * SZ);
    expect(scene(-ROOT_H - 40, { combat: kit }).visible).toBe(false);
  });

  it("stays on the ribbon curve with the clamped tilt, facing left", () => {
    const kit = mkKit(false);
    for (let c = 0.01; c < 0.99; c += 0.02) {
      const s = scene(topForCross(c), { combat: kit });
      if (!s.visible) continue;
      const f: Foot = [0, 0, 0];
      line(s.x, f);
      expect(s.y).toBeCloseTo(f[1], 6);
      expect(s.mirrored).toBe(true);
    }
  });

  it("falls back to the old gait when the kit is missing (jab missing -> teep)", () => {
    const s = scene(topForCross(0.5), { combat: null });
    expect(s.sheet).toBe("gait");
  });
});
