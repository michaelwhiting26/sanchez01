import { describe, expect, it } from "vitest";
import { INTRO } from "./config";
import { SigPen, tabulate } from "./sigpen";
import { CROUCH, MODE, bodyAt, lookYaw, peekProfile, penAt, planReturn, planStands, planWrite, revealedLength, sampleReturn, strokeEase, trackAt, type BodyState, type PenSampler, type PenState, type ReturnParams, type Vec } from "./writer";

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
  walkAccelMs: INTRO.walkAccelMs,
  walkDecelMs: INTRO.walkDecelMs,
  lookLeadMs: INTRO.lookLeadMs,
  lookTurnMs: INTRO.lookTurnMs,
  lookHoldMs: INTRO.lookHoldMs,
  sneakCycleMs: INTRO.sneakCycleMs,
  sneakMinMs: INTRO.sneakMinMs,
  sneakPauseAt: INTRO.sneakPauseAt,
  listenMs: INTRO.listenMs,
  duck: INTRO.duck,
  plantGlanceMs: INTRO.plantGlanceMs,
  plantGlanceKeys: INTRO.plantGlanceKeys,
  plantMs: INTRO.plantMs,
  shakeMs: INTRO.shakeMs,
  shakeHz: INTRO.shakeHz,
  commitMs: INTRO.commitMs,
  writeMs: INTRO.customWriteMs,
  liftMs: INTRO.liftMs,
  holdMs: INTRO.finishHoldMs,
  hideCrouchMs: INTRO.hideCrouchMs,
  stepMs: INTRO.stepMs,
  seed: INTRO.writeSeed,
  midGlanceMs: INTRO.midGlanceMs,
  midGlanceKeys: INTRO.midGlanceKeys,
  xEnter: 1700,
  xLook: 900,
  xHide: 1500,
  sneakCyclePx: 180,
  reachLo: -300,
  reachMid: 120,
  reachHi: 500,
  reachAllow: 40,
  reachAllowMax: 120,
  maxStands: 3,
  crouch: INTRO.crouch,
};
const noCrouch: ReturnParams = { ...params, crouch: null, duck: null };

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

describe("human writing (seeded)", () => {
  const opts = { seed: INTRO.writeSeed, commitMs: INTRO.commitMs };
  const plan = planWrite(LENS, INTRO.customWriteMs, INTRO.liftMs, opts);
  it("is deterministic, fills the time exactly, and completes every stroke", () => {
    const again = planWrite(LENS, INTRO.customWriteMs, INTRO.liftMs, opts);
    expect(Array.from(again.t0)).toEqual(Array.from(plan.t0));
    const last = plan.n - 1;
    expect((plan.t0[last] ?? 0) + (plan.td[last] ?? 0)).toBeCloseTo(INTRO.customWriteMs, 6);
    for (let i = 0; i < plan.n; i++) expect(revealedLength(plan, plan.totalMs, i)).toBeCloseTo(LENS[i] ?? 0, 6);
  });
  it("varies the pace: lifts 180-450 ms, uneven stroke speeds, some micro-pauses of 80-200 ms", () => {
    const lifts = Array.from(plan.gap).slice(1);
    for (const l of lifts) {
      expect(l).toBeGreaterThanOrEqual(180);
      expect(l).toBeLessThanOrEqual(450);
    }
    expect(new Set(lifts.map((l) => Math.round(l))).size).toBeGreaterThan(2);
    const speeds = LENS.map((L, i) => L / ((plan.td[i] ?? 1) - (plan.pauseMs[i] ?? 0)));
    expect(Math.max(...speeds) / Math.min(...speeds)).toBeGreaterThan(1.2);
    const pauses = Array.from(plan.pauseMs).filter((p) => p > 0);
    expect(pauses.length).toBeGreaterThan(0);
    for (const p of pauses) {
      expect(p).toBeGreaterThanOrEqual(80);
      expect(p).toBeLessThanOrEqual(200);
    }
  });
  it("the hand actually stops in a micro-pause, never goes backwards, and starts slowly", () => {
    const i = Array.from(plan.pauseMs).findIndex((p) => p > 0);
    const at = (plan.t0[i] ?? 0) + (plan.pauseAt[i] ?? 0) * ((plan.td[i] ?? 0) - (plan.pauseMs[i] ?? 0));
    expect(revealedLength(plan, at + (plan.pauseMs[i] ?? 0) * 0.9, i)).toBeCloseTo(revealedLength(plan, at + 1, i), 0);
    for (let s = 0; s < plan.n; s++) {
      let prev = 0;
      for (let t = plan.t0[s] ?? 0; t <= (plan.t0[s] ?? 0) + (plan.td[s] ?? 0); t += 10) {
        const v = revealedLength(plan, t, s);
        expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
        prev = v;
      }
    }
    const even = planWrite(LENS, INTRO.customWriteMs, INTRO.liftMs, { commitMs: 0 });
    const slow = planWrite(LENS, INTRO.customWriteMs, INTRO.liftMs, { commitMs: INTRO.commitMs });
    expect(revealedLength(slow, INTRO.commitMs, 0)).toBeLessThan(revealedLength(even, INTRO.commitMs, 0) * 0.6);
  });
  it("keeps the nozzle on the head of the stroke being drawn and never jumps", () => {
    const pen: PenState = { x: 0, y: 0, down: false, stroke: 0 };
    const p2: PenState = { x: 0, y: 0, down: false, stroke: 0 };
    const head: Vec = { x: 0, y: 0 };
    let worst = 0;
    for (let t = 0; t < plan.totalMs; t += 16) {
      penAt(plan, fakePen, t, pen);
      if (pen.down) {
        fakePen.sample(pen.stroke, revealedLength(plan, t, pen.stroke), head);
        expect(Math.hypot(pen.x - head.x, pen.y - head.y)).toBeLessThan(0.01);
      }
      penAt(plan, fakePen, t + 16, p2);
      worst = Math.max(worst, Math.hypot(p2.x - pen.x, p2.y - pen.y) / 16);
    }
    expect(worst).toBeLessThan(1.6);
  });
});

describe("planStands", () => {
  it("cuts contiguous runs that each fit the width, fewest possible", () => {
    const ext = [0, 1, 2, 3, 4, 5].map((i) => ({ a: i * 100, b: i * 100 + 80 }));
    const g = planStands(ext, 300);
    expect(g.map((x) => [x.from, x.to])).toEqual([[0, 3], [3, 6]]);
    for (const x of g) expect(x.b - x.a).toBeLessThanOrEqual(300);
    expect(planStands(ext, 10_000)).toHaveLength(1);
  });
});

describe("tracks", () => {
  it("eases between keys and holds the ends", () => {
    const o = { yaw: 0, pitch: 0 };
    const keys = [0, 0, 0, 100, 1, 0.5, 200, 1, 0.5];
    trackAt(keys, -5, o);
    expect(o.yaw).toBe(0);
    trackAt(keys, 50, o);
    expect(o.yaw).toBeCloseTo(0.5, 6);
    expect(o.pitch).toBeCloseTo(0.25, 6);
    trackAt(keys, 999, o);
    expect(o.yaw).toBe(1);
  });
  it("peek rises, holds at the top and sinks back to zero", () => {
    const c = INTRO.crouch;
    expect(peekProfile(c, 0)).toBe(0);
    expect(peekProfile(c, c.peekRiseMs + c.peekHoldMs / 2)).toBe(1);
    expect(peekProfile(c, c.peekRiseMs + c.peekHoldMs + c.peekSinkMs)).toBe(0);
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

const newBody = (): BodyState => ({ mode: 0, x: 0, mirrored: false, dist: 0, yaw: 0, wt: 0, turn: 1, stepping: false, travelled: 0, cphase: 0, depth: 0, pitch: 0, breath: 0, shake: 0, glance: false, duck: false });

describe("planReturn timeline", () => {
  const plan = planReturn(params, fakePen);
  const body = newBody();
  it("phases are ordered, and the writing lasts INTRO.customWriteMs", () => {
    const t = [plan.p.startMs, plan.tWalkEnd, plan.tLookEnd, plan.tDownEnd, plan.tScanEnd, plan.tPeekEnd, plan.tGlanceEnd, plan.tSneak0, plan.tListen0, plan.tListen1, plan.tDuckDown1, plan.tDuckHold1, plan.tDuck1, plan.tSneakEnd, plan.tPlantGlanceEnd, plan.tTurnEnd, plan.tWrite0, plan.tWrite1, plan.tHoldEnd, plan.tHideMove1, plan.tEnd];
    for (let i = 1; i < t.length; i++) expect(t[i] ?? 0).toBeGreaterThan(t[i - 1] ?? 0);
    expect(plan.tWrite1 - plan.tWrite0).toBeCloseTo(INTRO.customWriteMs, 6);
    expect(plan.tHoldEnd - plan.tWrite1).toBeCloseTo(INTRO.finishHoldMs, 6);
  });
  it("visits walk, look, crouch, sneak, duck, sneak, look, write, out in order", () => {
    const seen: number[] = [];
    for (let t = plan.p.startMs - 100; t <= plan.tEnd + 5000; t += 25) {
      sampleReturn(plan, t, body);
      if (seen[seen.length - 1] !== body.mode) seen.push(body.mode);
    }
    // the mid-word glance is a look-sheet beat inside the writing, not a separate mode
    expect(seen).toEqual([MODE.off, MODE.walk, MODE.look, MODE.crouch, MODE.sneak, MODE.crouch, MODE.sneak, MODE.look, MODE.write, MODE.sneak, MODE.crouch]);
    sampleReturn(plan, plan.tWalkEnd + 500, body);
    expect(body.x).toBe(params.xLook);
  });
  it("the crouch block runs down, scan, peek, glance, rise in that order with the planned durations", () => {
    const c = INTRO.crouch;
    expect(plan.tDownEnd - plan.tLookEnd).toBe(c.downMs);
    expect(plan.tScanEnd - plan.tDownEnd).toBe(c.scanMs);
    expect(plan.tPeekEnd - plan.tScanEnd).toBe(c.peekRiseMs + c.peekHoldMs + c.peekSinkMs);
    expect(plan.tSneak0 - plan.tGlanceEnd).toBe(c.riseMs);
    const phases: number[] = [];
    for (let t = plan.tLookEnd; t < plan.tSneak0; t += 20) {
      sampleReturn(plan, t, body);
      expect(body.mode).toBe(MODE.crouch);
      expect(body.x).toBe(params.xLook); // feet planted for the whole crouch
      if (phases[phases.length - 1] !== body.cphase) phases.push(body.cphase);
    }
    expect(phases).toEqual([CROUCH.down, CROUCH.scan, CROUCH.peek, CROUCH.glance, CROUCH.rise]);
    const added = plan.tSneak0 - plan.tLookEnd;
    expect(added).toBeGreaterThan(5500);
    expect(added).toBeLessThan(7500);
  });
  it("goes down and up smoothly (monotonic depth), and the head moves irregularly through the scan with a dead-still freeze", () => {
    let prev = -1;
    for (let t = plan.tLookEnd; t < plan.tDownEnd; t += 10) {
      sampleReturn(plan, t, body);
      expect(body.depth).toBeGreaterThanOrEqual(prev);
      prev = body.depth;
    }
    const yaws = new Set<number>();
    let flips = 0;
    let pv = 0;
    let pitchMax = 0;
    for (let t = plan.tDownEnd; t < plan.tScanEnd; t += 10) {
      sampleReturn(plan, t, body);
      yaws.add(Math.round(body.yaw * 20));
      pitchMax = Math.max(pitchMax, body.pitch);
      if ((body.yaw > 0.5) !== (pv > 0.5)) flips++;
      pv = body.yaw;
    }
    expect(yaws.size).toBeGreaterThan(8);
    expect(flips).toBeGreaterThanOrEqual(3); // back, forward, back (double-take), settle
    expect(pitchMax).toBeGreaterThan(0.5);
    const c = INTRO.crouch;
    sampleReturn(plan, plan.tDownEnd + c.freezeAtMs + 200, body);
    const y0 = body.yaw;
    const b0 = body.breath;
    sampleReturn(plan, plan.tDownEnd + c.freezeAtMs + c.freezeMs - 200, body);
    expect(body.yaw).toBe(y0);
    expect(b0).toBe(0);
    expect(body.breath).toBe(0);
    sampleReturn(plan, plan.tDownEnd + 1000, body);
    expect(body.breath).toBe(1); // breathing while waiting
    // the peek rises then sinks
    sampleReturn(plan, plan.tScanEnd + c.peekRiseMs + 10, body);
    expect(body.depth).toBe(1);
    sampleReturn(plan, plan.tPeekEnd - 1, body);
    expect(body.depth).toBeLessThan(0.05);
    // and the rise back out ends standing
    sampleReturn(plan, plan.tSneak0 - 1, body);
    expect(body.cphase).toBe(CROUCH.rise);
    expect(body.depth).toBeLessThan(0.02);
  });
  it("skips the crouch beats gracefully when the crouch sheets are missing, and still completes", () => {
    const p = planReturn(noCrouch, fakePen);
    expect(p.tSneak0).toBe(p.tLookEnd);
    expect(p.tSneak0).toBeLessThan(plan.tSneak0);
    expect(p.tEnd).toBeGreaterThan(p.tWrite1);
    const seen: number[] = [];
    for (let t = p.p.startMs - 100; t <= p.tEnd + 5000; t += 25) {
      sampleReturn(p, t, body);
      if (seen[seen.length - 1] !== body.mode) seen.push(body.mode);
    }
    expect(seen).toEqual([MODE.off, MODE.walk, MODE.look, MODE.sneak, MODE.look, MODE.write, MODE.sneak, MODE.look]);
  });
  it("walks in from the right edge heading left with no brisk start (velocity ramps up), and does not leave", () => {
    sampleReturn(plan, plan.p.startMs + 1, body);
    expect(body.x).toBeGreaterThan(params.xEnter - 2);
    expect(body.mirrored).toBe(true);
    const v = (t: number): number => {
      sampleReturn(plan, t, body);
      const x0 = body.x;
      sampleReturn(plan, t + 20, body);
      return Math.abs(body.x - x0) / 20;
    };
    const s = plan.p.startMs;
    expect(v(s + 40)).toBeLessThan(v(s + 500) * 0.25);
    expect(v(s + 500)).toBeLessThan(v(s + 2000));
    expect(v(plan.tWalkEnd - 60)).toBeLessThan(v(plan.tWalkEnd - 2000) * 0.2);
    sampleReturn(plan, plan.tWalkEnd - 1, body);
    expect(Math.abs(body.x - params.xLook)).toBeLessThan(2);
  });
  it("ends hiding: steps to the hiding place, crouches slowly, then holds the final crouched frame for ever, dead still", () => {
    sampleReturn(plan, plan.tHoldEnd + 5, body);
    expect(body.mode).toBe(MODE.sneak);
    sampleReturn(plan, plan.tHideMove1 - 1, body);
    expect(Math.abs(body.x - params.xHide)).toBeLessThan(2);
    let prev = -1;
    for (let t = plan.tHideMove1; t <= plan.tEnd; t += 10) {
      sampleReturn(plan, t, body);
      expect(body.mode).toBe(MODE.crouch);
      expect(body.x).toBe(params.xHide);
      expect(body.depth).toBeGreaterThanOrEqual(prev);
      prev = body.depth;
    }
    expect(plan.tEnd - plan.tHideMove1).toBe(INTRO.hideCrouchMs);
    const a: BodyState = newBody();
    sampleReturn(plan, plan.tEnd, a);
    for (const t of [plan.tEnd + 1, plan.tEnd + 60_000, 1e9]) {
      sampleReturn(plan, t, body);
      expect(body).toEqual(a);
    }
    expect(a.depth).toBe(1);
    expect(a.breath).toBe(0);
    expect(a.mode).toBe(MODE.crouch);
  });
  it("the tiptoe takes at least sneakMinMs of moving time, plus a listen and a duck, without the feet sliding (distance monotonic, x continuous)", () => {
    const moving = plan.tSneakEnd - plan.tSneak0 - (plan.tDuck1 - plan.tListen0);
    expect(moving).toBeGreaterThanOrEqual(INTRO.sneakMinMs - 1e-6);
    expect(plan.tListen1 - plan.tListen0).toBe(INTRO.listenMs);
    expect(plan.tDuck1 - plan.tListen1).toBe(INTRO.duck.downMs + INTRO.duck.holdMs + INTRO.duck.riseMs);
    let prev = -1;
    let px = params.xLook;
    for (let t = plan.tSneak0; t < plan.tSneakEnd; t += 10) {
      sampleReturn(plan, t, body);
      expect(Math.abs(body.x - px)).toBeLessThan(6); // no teleporting
      px = body.x;
      if (body.mode === MODE.sneak) {
        expect(body.dist).toBeGreaterThanOrEqual(prev - 1e-9);
        prev = body.dist;
      }
    }
    // frozen on one foot while listening
    sampleReturn(plan, plan.tListen0 + 50, body);
    const d0 = body.dist;
    sampleReturn(plan, plan.tListen1 - 50, body);
    expect(body.dist).toBe(d0);
    expect(body.mode).toBe(MODE.sneak);
  });
  it("the duck is fast down, holds low with a head scan, and slowly back up", () => {
    const d = INTRO.duck;
    expect(d.downMs).toBeLessThan(d.riseMs / 2);
    sampleReturn(plan, plan.tListen1 + d.downMs / 2, body);
    expect(body.mode).toBe(MODE.crouch);
    expect(body.duck).toBe(true);
    expect(body.cphase).toBe(CROUCH.down);
    sampleReturn(plan, plan.tDuckDown1 + 100, body);
    expect(body.cphase).toBe(CROUCH.scan);
    expect(body.depth).toBe(1);
    sampleReturn(plan, plan.tDuckDown1 + 400, body);
    expect(body.yaw).toBeGreaterThan(0.5);
    sampleReturn(plan, plan.tDuck1 - 1, body);
    expect(body.depth).toBeLessThan(0.02);
    expect(body.x).toBeCloseTo(plan.xPause, 6);
  });
  it("is planted at the C's standing place: body x + reach mid = middle of the first run's pen extent", () => {
    const g = plan.stands[0];
    expect(g).toBeDefined();
    expect(plan.xStart + params.reachMid).toBeCloseTo(((g?.a ?? 0) + (g?.b ?? 0)) / 2, 6);
    sampleReturn(plan, plan.tWrite0 + 10, body);
    expect(body.mode).toBe(MODE.write);
    expect(body.x).toBeCloseTo(plan.xStart, 6);
  });
});

describe("standing, turning, shaking, and repositioning", () => {
  const plan = planReturn(params, fakePen);
  const body = newBody();
  it("looks back once at the C, turns to the wall, shakes the can (about 8 Hz, then still), and only then writes", () => {
    sampleReturn(plan, plan.tSneakEnd + 300, body);
    expect(body.mode).toBe(MODE.look);
    expect(body.yaw).toBeGreaterThan(0.9);
    sampleReturn(plan, plan.tPlantGlanceEnd + 1, body);
    expect(body.mode).toBe(MODE.write);
    expect(body.turn).toBeLessThan(0.05);
    sampleReturn(plan, plan.tTurnEnd, body);
    expect(body.turn).toBeCloseTo(1, 6);
    let sign = 0;
    let crossings = 0;
    let amp = 0;
    for (let t = plan.tTurnEnd; t < plan.tWrite0; t += 5) {
      sampleReturn(plan, t, body);
      amp = Math.max(amp, Math.abs(body.shake));
      const sg = Math.sign(body.shake);
      if (sg !== 0 && sign !== 0 && sg !== sign) crossings++;
      if (sg !== 0) sign = sg;
    }
    expect(amp).toBeGreaterThan(0.8);
    expect(crossings).toBeGreaterThanOrEqual(2 * INTRO.shakeHz * (INTRO.shakeMs / 1000) - 2);
    sampleReturn(plan, plan.tWrite0 + 50, body);
    expect(body.shake).toBe(0);
  });
  it("plants for the whole writing: hips x is constant inside each standing place, at most 2 repositions, none mid-stroke", () => {
    expect(plan.steps.length).toBeLessThanOrEqual(2);
    expect(plan.stands.length).toBeLessThanOrEqual(3);
    expect(plan.steps.length).toBe(plan.stands.length - 1);
    let stepped = false;
    let lastX = plan.xStart;
    for (let t = plan.tWrite0; t < plan.tWrite1; t += 10) {
      sampleReturn(plan, t, body);
      const wt = t - plan.tWrite0;
      if (body.stepping) {
        stepped = true;
        // never while the nozzle is on the wall
        penAt(plan.write, fakePen, wt, pen);
        expect(pen.down).toBe(false);
      } else {
        const inStep = plan.steps.some((s) => wt >= s.t0 && wt <= s.t1);
        if (!inStep) expect(Math.abs(body.x - lastX)).toBeLessThan(1e-6 + (plan.steps.some((s) => Math.abs(wt - s.t1) < 11) ? 1e9 : 0));
      }
      lastX = body.x;
    }
    expect(stepped || plan.steps.length === 0).toBe(true);
    for (const s of plan.steps) expect(s.t1 - s.t0).toBe(INTRO.stepMs);
    for (const s of plan.steps) {
      expect(bodyAt(plan.steps, plan.xStart, s.t0 - 1)).toBeCloseTo(s.from, 6);
      expect(bodyAt(plan.steps, plan.xStart, s.t1 + 1)).toBeCloseTo(s.to, 6);
    }
  });
  const pen: PenState = { x: 0, y: 0, down: false, stroke: 0 };
  it("every stroke lies within one standing place's reach (plus the lean allowance)", () => {
    const allow = plan.allow;
    plan.stands.forEach((g, j) => {
      const x = (g.a + g.b) / 2 - params.reachMid;
      expect(g.a).toBeGreaterThanOrEqual(x + params.reachLo - allow - 1e-6);
      expect(g.b).toBeLessThanOrEqual(x + params.reachHi + allow + 1e-6);
      expect(g.from).toBe(j === 0 ? 0 : (plan.stands[j - 1]?.to ?? -1));
    });
    expect(plan.stands[plan.stands.length - 1]?.to).toBe(LENS.length);
  });
  it("one longer rest mid-word carries a glance back, feet still, and the glance ends before the next stroke", () => {
    expect(plan.glance1 - plan.glance0).toBe(INTRO.midGlanceMs);
    let seen = false;
    let yawMax = 0;
    for (let t = plan.tWrite0 + plan.glance0; t < plan.tWrite0 + plan.glance1; t += 20) {
      sampleReturn(plan, t, body);
      if (body.glance) {
        seen = true;
        yawMax = Math.max(yawMax, body.yaw);
        expect(body.stepping).toBe(false);
      }
      penAt(plan.write, fakePen, t - plan.tWrite0, pen);
      expect(pen.down).toBe(false);
    }
    expect(seen).toBe(true);
    expect(yawMax).toBeGreaterThan(0.95);
  });
  it("crossfade cuts are all inside the pass and sorted", () => {
    expect(plan.cuts.length).toBeGreaterThan(6);
    for (let i = 0; i < plan.cuts.length; i++) {
      expect(plan.cuts[i]).toBeGreaterThan(plan.p.startMs);
      expect(plan.cuts[i]).toBeLessThanOrEqual(plan.tEnd);
      if (i > 0) expect(plan.cuts[i]).toBeGreaterThanOrEqual(plan.cuts[i - 1] ?? 0);
    }
  });
  it("total second pass runs about half a minute", () => {
    const total = (plan.tEnd - plan.p.startMs) / 1000;
    expect(total).toBeGreaterThan(22);
    expect(total).toBeLessThan(36);
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
