import { describe, expect, it } from "vitest";
import { INTRO } from "./config";
import { SigPen, tabulate } from "./sigpen";
import { MODE, bodyAt, lookYaw, penAt, planReturn, planSteps, planWrite, revealedLength, sampleReturn, strokeEase, type BodyState, type PenSampler, type PenState, type ReturnParams, type Vec } from "./writer";

/** Six strokes left to right, each a diagonal of a different length, in canvas px. */
const LENS = [300, 220, 260, 400, 180, 340];
const fakePen: PenSampler = {
  count: LENS.length,
  lens: LENS,
  sample(i: number, l: number, out: Vec): void {
    const start = 200 + i * 260;
    const f = l / (LENS[i] ?? 1);
    out.x = start + f * 240;
    out.y = 500 - f * 120 * (i % 2 === 0 ? 1 : -1);
  },
};

const params: ReturnParams = {
  startMs: INTRO.returnStartMs,
  walkInMs: INTRO.walkInMs,
  lookLeadMs: INTRO.lookLeadMs,
  lookTurnMs: INTRO.lookTurnMs,
  lookHoldMs: INTRO.lookHoldMs,
  sneakCycleMs: INTRO.sneakCycleMs,
  plantMs: INTRO.plantMs,
  writeMs: INTRO.customWriteMs,
  liftMs: INTRO.liftMs,
  holdMs: INTRO.finishHoldMs,
  walkOutMs: INTRO.walkOutMs,
  stepMs: INTRO.stepMs,
  walkEaseExp: INTRO.walkEaseExp,
  xEnter: 1700,
  xLook: 900,
  xExit: 1700,
  sneakCyclePx: 180,
  reachMid: 120,
  reachTol: 70,
};

describe("strokeEase", () => {
  it("runs 0..1, is monotonic, and is slower at the ends than the middle", () => {
    expect(strokeEase(0)).toBe(0);
    expect(strokeEase(1)).toBeCloseTo(1, 9);
    let prev = 0;
    for (let u = 0.01; u <= 1; u += 0.01) {
      const v = strokeEase(u);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
    expect(strokeEase(0.05)).toBeLessThan(0.05);
    expect(strokeEase(0.55) - strokeEase(0.45)).toBeGreaterThan(strokeEase(0.1) - strokeEase(0));
  });
});

describe("planWrite / penAt", () => {
  const plan = planWrite(LENS, INTRO.customWriteMs, INTRO.liftMs);
  it("fills the requested time exactly, in stroke order, with a lift between strokes", () => {
    const last = plan.n - 1;
    expect((plan.t0[last] ?? 0) + (plan.td[last] ?? 0)).toBeCloseTo(INTRO.customWriteMs, 6);
    for (let i = 1; i < plan.n; i++) expect((plan.t0[i] ?? 0) - (plan.t0[i - 1] ?? 0) - (plan.td[i - 1] ?? 0)).toBeCloseTo(INTRO.liftMs, 6);
  });
  it("the nozzle is exactly on the head of the stroke being drawn, in every 100 ms sample", () => {
    const pen: PenState = { x: 0, y: 0, down: false, stroke: 0 };
    const head: Vec = { x: 0, y: 0 };
    let down = 0;
    for (let t = 0; t <= plan.totalMs; t += 100) {
      penAt(plan, fakePen, t, pen);
      if (pen.down) {
        down++;
        fakePen.sample(pen.stroke, revealedLength(plan, t, pen.stroke), head);
        expect(Math.hypot(pen.x - head.x, pen.y - head.y)).toBeLessThan(0.01);
      }
    }
    expect(down).toBeGreaterThan(60);
  });
  it("lays no paint during a lift and moves smoothly to the next stroke's start", () => {
    const pen: PenState = { x: 0, y: 0, down: false, stroke: 0 };
    const t = (plan.t0[1] ?? 0) - INTRO.liftMs / 2;
    penAt(plan, fakePen, t, pen);
    expect(pen.down).toBe(false);
    const a: Vec = { x: 0, y: 0 };
    const b: Vec = { x: 0, y: 0 };
    fakePen.sample(0, LENS[0] ?? 0, a);
    fakePen.sample(1, 0, b);
    expect(pen.x).toBeGreaterThan(Math.min(a.x, b.x) - 1);
    expect(pen.x).toBeLessThan(Math.max(a.x, b.x) + 1);
  });
  it("never jumps: nozzle speed stays under 1.2 px/ms at 16 ms steps across the whole writing", () => {
    const p1: PenState = { x: 0, y: 0, down: false, stroke: 0 };
    const p2: PenState = { x: 0, y: 0, down: false, stroke: 0 };
    let worst = 0;
    for (let t = 0; t < plan.totalMs; t += 16) {
      penAt(plan, fakePen, t, p1);
      penAt(plan, fakePen, t + 16, p2);
      worst = Math.max(worst, Math.hypot(p2.x - p1.x, p2.y - p1.y) / 16);
    }
    expect(worst).toBeLessThan(1.2);
  });
  it("reveals every stroke fully at the end and none before the start", () => {
    for (let i = 0; i < plan.n; i++) {
      expect(revealedLength(plan, -50, i)).toBe(0);
      expect(revealedLength(plan, plan.totalMs, i)).toBeCloseTo(LENS[i] ?? 0, 6);
    }
  });
});

describe("shuffle steps", () => {
  it("keeps the pen within tolerance of reach (plus the step's own lag) and steps only when needed", () => {
    const plan = planWrite(LENS, INTRO.customWriteMs, INTRO.liftMs);
    const tmp: PenState = { x: 0, y: 0, down: false, stroke: 0 };
    const px = (t: number): number => {
      penAt(plan, fakePen, t, tmp);
      return tmp.x;
    };
    const x0 = px(0) - 120;
    const steps = planSteps(x0, px, plan.totalMs, 120, 70, INTRO.stepMs);
    expect(steps.length).toBeGreaterThan(2);
    expect(steps.length).toBeLessThan(40);
    for (let t = 0; t <= plan.totalMs; t += 50) expect(Math.abs(px(t) - bodyAt(steps, x0, t) - 120)).toBeLessThan(70 + 260);
    for (const s of steps) expect(s.t1 - s.t0).toBe(INTRO.stepMs);
  });
});

describe("lookYaw", () => {
  it("turns back, holds, forward, holds, back, holds, forward, holds, then rests forward", () => {
    const p = params;
    expect(lookYaw(p, 0)).toBe(0);
    const backAt = p.lookLeadMs + p.lookTurnMs + 100;
    expect(lookYaw(p, backAt)).toBe(1);
    expect(lookYaw(p, p.lookLeadMs + p.lookTurnMs + (p.lookHoldMs[0] ?? 0) + p.lookTurnMs + 50)).toBe(0);
    let total = p.lookLeadMs;
    for (const h of p.lookHoldMs) total += p.lookTurnMs + h;
    expect(lookYaw(p, total + 500)).toBe(0);
    let flips = 0;
    let prev = 0;
    for (let t = 0; t < total; t += 20) {
      const y = lookYaw(p, t);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(1);
      if ((y > 0.5) !== (prev > 0.5)) flips++;
      prev = y;
    }
    expect(flips).toBe(4);
  });
});

describe("planReturn timeline", () => {
  const plan = planReturn(params, fakePen);
  const body: BodyState = { mode: 0, x: 0, mirrored: false, dist: 0, yaw: 0, wt: 0 };
  it("phases are ordered, and the writing lasts INTRO.customWriteMs", () => {
    const t = [plan.p.startMs, plan.tWalkEnd, plan.tLookEnd, plan.tSneakEnd, plan.tWrite0, plan.tWrite1, plan.tHoldEnd, plan.tEnd];
    for (let i = 1; i < t.length; i++) expect(t[i] ?? 0).toBeGreaterThan(t[i - 1] ?? 0);
    expect(plan.tWrite1 - plan.tWrite0).toBeCloseTo(INTRO.customWriteMs, 6);
    expect(plan.tHoldEnd - plan.tWrite1).toBeCloseTo(INTRO.finishHoldMs, 6);
  });
  it("visits walk, look, sneak, write, out in order and stays in one place while looking and writing's start", () => {
    const seen: number[] = [];
    for (let t = plan.p.startMs - 100; t <= plan.tEnd + 100; t += 25) {
      sampleReturn(plan, t, body);
      if (seen[seen.length - 1] !== body.mode) seen.push(body.mode);
    }
    expect(seen).toEqual([MODE.off, MODE.walk, MODE.look, MODE.sneak, MODE.write, MODE.out, MODE.off]);
    sampleReturn(plan, plan.tWalkEnd + 500, body);
    expect(body.x).toBe(params.xLook);
  });
  it("walks in from the right edge heading left, and leaves right", () => {
    sampleReturn(plan, plan.p.startMs + 1, body);
    expect(body.x).toBeGreaterThan(params.xEnter - 20);
    expect(body.mirrored).toBe(true);
    sampleReturn(plan, plan.tHoldEnd + 50, body);
    expect(body.mirrored).toBe(false);
    sampleReturn(plan, plan.tEnd - 1, body);
    expect(body.x).toBeGreaterThan(params.xExit - 20);
  });
  it("tiptoe speed matches its cycle on average, so the feet do not slide", () => {
    const cyclesPerMs = 1 / params.sneakCycleMs;
    const ms = plan.tSneakEnd - plan.tLookEnd;
    const px = Math.abs(plan.xStart - params.xLook);
    expect(px / ms).toBeCloseTo(params.sneakCyclePx * cyclesPerMs, 6);
    // and the gait frame is a function of ground covered, so it is exact at any speed: distance is monotonic
    let prev = -1;
    for (let t = plan.tLookEnd; t < plan.tSneakEnd; t += 20) {
      sampleReturn(plan, t, body);
      expect(body.dist).toBeGreaterThanOrEqual(prev);
      prev = body.dist;
    }
  });
  it("is planted at the C: body x + reach = pen start x", () => {
    const s: Vec = { x: 0, y: 0 };
    fakePen.sample(0, 0, s);
    expect(plan.xStart + params.reachMid).toBeCloseTo(s.x, 6);
    sampleReturn(plan, plan.tWrite0 - 10, body);
    expect(body.mode).toBe(MODE.write);
    expect(body.x).toBeCloseTo(plan.xStart, 6);
  });
});

describe("SigPen (svg -> canvas)", () => {
  const line = tabulate(100, (l) => ({ x: l, y: l / 2 }));
  it("maps svg units through the affine, dpr and the box's movement", () => {
    // scale 2, rotate 90 deg (a=0,b=2,c=-2,d=0), translate (10, 20)
    const pen = new SigPen([line], { a: 0, b: 2, c: -2, d: 0, e: 10, f: 20 }, 2, 5, 7);
    const out: Vec = { x: 0, y: 0 };
    pen.setOrigin(5, 7);
    pen.sample(0, 40, out);
    // svg (40, 20): x = (0*40 + -2*20 + 10) * 2 = -60 ; y = (2*40 + 0 + 20) * 2 = 200
    expect(out.x).toBeCloseTo(-60, 3);
    expect(out.y).toBeCloseTo(200, 3);
    pen.setOrigin(15, 7); // the page moved 10 css px right
    pen.sample(0, 40, out);
    expect(out.x).toBeCloseTo(-40, 3);
  });
  it("clamps past the ends and reports each stroke's length", () => {
    const pen = new SigPen([line], { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }, 1, 0, 0);
    const out: Vec = { x: 0, y: 0 };
    pen.sample(0, -5, out);
    expect(out.x).toBeCloseTo(0, 6);
    pen.sample(0, 999, out);
    expect(out.x).toBeCloseTo(100, 4);
    expect(pen.lens[0]).toBe(100);
  });
});
