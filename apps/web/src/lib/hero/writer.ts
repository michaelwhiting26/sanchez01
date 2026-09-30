/**
 * The return pass, as pure functions of time: walk in, look behind and ahead, crouch/scan/peek, tiptoe (listen, duck) to the C, set himself, write "Custom" stroke by stroke, walk off.
 * Nothing here touches the DOM or allocates per call, so the engine's loop and the dev seek API render the same frame for the same ms.
 * Units: ms for time, canvas px for space.
 */

export interface Vec {
  x: number;
  y: number;
}

/** Where the pen is on the signature: per-stroke lengths (svg units) and a sampler that writes canvas-px coordinates of the point `l` along stroke `i`. */
export interface PenSampler {
  readonly count: number;
  readonly lens: ArrayLike<number>;
  sample(i: number, l: number, out: Vec): void;
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const smoother = (v: number): number => {
  const c = clamp01(v);
  return c * c * c * (c * (6 * c - 15) + 10);
};

/** One stroke's ease: slow at the start and the end, never quite stopping (a hand does not freeze mid-word). u and result in 0..1. */
export const strokeEase = (u: number): number => 0.35 * clamp01(u) + 0.65 * smoother(u);

// ------------------------------------------------------------------ the writing

/** Deterministic PRNG (mulberry32): the same seed always gives the same hand. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface WriteOpts {
  /** Seeds the human variation (pace per stroke, micro-pauses, lift lengths). Without it the writing is even: proportional strokes, equal lifts. */
  seed?: number;
  /** Per gap (gap g sits before stroke g+1): a fixed length in ms, or <= 0 for the seeded random one. */
  gapMs?: readonly number[];
  /** Per gap: extra rest at the end of the gap, after the nozzle has glided to the next stroke (for a glance back). */
  holdMs?: readonly number[];
  /** Random lift range, ms. */
  liftMin?: number;
  liftMax?: number;
  /** The first stroke starts at a crawl and reaches full pace over this long. */
  commitMs?: number;
}

export interface WritePlan {
  n: number;
  lens: ArrayLike<number>;
  /** Start and duration of each stroke, ms from the start of the writing. */
  t0: Float64Array;
  td: Float64Array;
  /** Length of the gap before stroke i (index 0 unused) and the part of it, at its end, spent resting on the next stroke's start. */
  gap: Float64Array;
  hold: Float64Array;
  /** Per stroke: a micro-pause of `pauseMs` (0 = none) starting a share `pauseAt` of the way through, an exponent shaping its pace, and the commit crawl (stroke 0 only). */
  pauseMs: Float64Array;
  pauseAt: Float64Array;
  skew: Float64Array;
  commitMs: number;
  liftMs: number;
  totalMs: number;
}

/** Split `totalMs` over the strokes (by length over pace) with a gap between strokes. Even by default; human when `o.seed` is given. */
export function planWrite(lens: ArrayLike<number>, totalMs: number, liftMs: number, o: WriteOpts = {}): WritePlan {
  const n = lens.length;
  const rnd = o.seed === undefined ? null : rng(o.seed);
  const gap = new Float64Array(n);
  const hold = new Float64Array(n);
  const pauseMs = new Float64Array(n);
  const pauseAt = new Float64Array(n);
  const skew = new Float64Array(n).fill(1);
  const weight = new Float64Array(n);
  let sum = 0;
  let fixed = 0;
  for (let i = 0; i < n; i++) {
    const pace = rnd ? 0.7 + 0.65 * rnd() : 1;
    weight[i] = (lens[i] ?? 0) / pace;
    sum += weight[i] ?? 0;
    if (rnd) {
      if (rnd() < 0.6) {
        pauseMs[i] = 80 + 120 * rnd();
        pauseAt[i] = 0.3 + 0.4 * rnd();
      }
      skew[i] = 0.85 + 0.35 * rnd();
    }
    if (i > 0) {
      const fixedGap = o.gapMs?.[i - 1] ?? 0;
      const lo = o.liftMin ?? 180;
      const hi = o.liftMax ?? 450;
      gap[i] = fixedGap > 0 ? fixedGap : rnd ? lo + (hi - lo) * rnd() : liftMs;
      hold[i] = Math.min(gap[i] ?? 0, o.holdMs?.[i - 1] ?? 0);
      fixed += gap[i] ?? 0;
    }
    fixed += pauseMs[i] ?? 0;
  }
  const drawMs = Math.max(0, totalMs - fixed);
  const t0 = new Float64Array(n);
  const td = new Float64Array(n);
  let t = 0;
  for (let i = 0; i < n; i++) {
    t += gap[i] ?? 0;
    // the micro-pause belongs to the stroke's own time
    td[i] = (sum > 0 ? (drawMs * (weight[i] ?? 0)) / sum : 0) + (pauseMs[i] ?? 0);
    t0[i] = t;
    t += td[i] ?? 0;
  }
  return { n, lens, t0, td, gap, hold, pauseMs, pauseAt, skew, commitMs: o.commitMs ?? 0, liftMs, totalMs };
}

/** Length of stroke `i` laid down at `t` ms into the writing. */
export function revealedLength(plan: WritePlan, t: number, i: number): number {
  const d = plan.td[i] ?? 0;
  const L = plan.lens[i] ?? 0;
  if (d <= 0) return t >= (plan.t0[i] ?? 0) ? L : 0;
  let local = t - (plan.t0[i] ?? 0);
  let dEff = d;
  const pm = plan.pauseMs[i] ?? 0;
  if (pm > 0) {
    // hand stops for a moment mid-stroke
    const tp = (plan.pauseAt[i] ?? 0.5) * (d - pm);
    if (local > tp + pm) local -= pm;
    else if (local > tp) local = tp;
    dEff -= pm;
  }
  const C = i === 0 ? plan.commitMs : 0;
  if (C > 0 && dEff > C) {
    // commit: pace ramps from a crawl to full over C ms (distance covered by then is C/2 of full pace)
    local = local < C ? (local * local) / (2 * C) : local - C / 2;
    dEff -= C / 2;
  }
  return L * strokeEase(clamp01(local / dEff) ** (plan.skew[i] ?? 1));
}

export interface PenState extends Vec {
  /** True while the nozzle is on the wall laying paint. */
  down: boolean;
  /** Stroke in progress (or the one the nozzle is travelling to, in a lift). */
  stroke: number;
}

const sa: Vec = { x: 0, y: 0 };
const sb: Vec = { x: 0, y: 0 };

/** The nozzle at `t` ms into the writing: on the stroke head while a stroke is drawn, gliding off the wall to the next start in a lift (then resting there for the gap's hold). */
export function penAt(plan: WritePlan, pen: PenSampler, t: number, out: PenState): void {
  const n = plan.n;
  out.down = false;
  out.stroke = 0;
  if (n === 0) {
    out.x = 0;
    out.y = 0;
    return;
  }
  if (t <= 0) {
    pen.sample(0, 0, out);
    return;
  }
  for (let i = 0; i < n; i++) {
    const s0 = plan.t0[i] ?? 0;
    const s1 = s0 + (plan.td[i] ?? 0);
    if (t < s0) {
      // the lift that leads into stroke i
      const prev = i - 1;
      pen.sample(prev, plan.lens[prev] ?? 0, sa);
      pen.sample(i, 0, sb);
      const glide = Math.max(1, (plan.gap[i] ?? plan.liftMs) - (plan.hold[i] ?? 0));
      const f = smooth((t - (plan.t0[prev] ?? 0) - (plan.td[prev] ?? 0)) / glide);
      out.x = sa.x + (sb.x - sa.x) * f;
      out.y = sa.y + (sb.y - sa.y) * f;
      out.stroke = i;
      return;
    }
    if (t <= s1) {
      pen.sample(i, revealedLength(plan, t, i), out);
      out.down = t < s1 && t > s0;
      out.stroke = i;
      return;
    }
  }
  pen.sample(n - 1, plan.lens[n - 1] ?? 0, out);
  out.stroke = n - 1;
}

// ------------------------------------------------------------------ standing places along the word

export interface Step {
  t0: number;
  t1: number;
  from: number;
  to: number;
}

/** Body x at time `t` given the repositioning steps (sorted); the body holds still between steps. */
export function bodyAt(steps: readonly Step[], x0: number, t: number): number {
  let x = x0;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (!s || t < s.t0) break;
    x = t >= s.t1 ? s.to : s.from + (s.to - s.from) * smooth((t - s.t0) / (s.t1 - s.t0));
  }
  return x;
}

export interface StandGroup {
  /** First stroke and one past the last stroke covered from this place, and the pen's x range over them (canvas px). */
  from: number;
  to: number;
  a: number;
  b: number;
}

/**
 * Cut the strokes into the fewest runs that each fit in one standing place: a run's pen x extent (over all its strokes) must be at most `width`.
 * `ext` gives each stroke's x range. Greedy in stroke order, so runs are contiguous.
 */
export function planStands(ext: ReadonlyArray<{ a: number; b: number }>, width: number): StandGroup[] {
  const groups: StandGroup[] = [];
  let cur: StandGroup | null = null;
  for (let i = 0; i < ext.length; i++) {
    const e = ext[i];
    if (!e) continue;
    if (cur && Math.max(cur.b, e.b) - Math.min(cur.a, e.a) <= width) {
      cur.to = i + 1;
      cur.a = Math.min(cur.a, e.a);
      cur.b = Math.max(cur.b, e.b);
    } else {
      cur = { from: i, to: i + 1, a: e.a, b: e.b };
      groups.push(cur);
    }
  }
  return groups;
}

// ------------------------------------------------------------------ the whole return pass

/**
 * The suspicious crouch inserted between the standing look and the tiptoe: down, wait and scan, peek over, one more glance, rise.
 * All times in ms. Head tracks are flat arrays of keys `[t, yaw, pitch, t, yaw, pitch, ...]` (t ms from the start of that track, yaw 0..1 with 1 fully back,
 * pitch -1..1 with positive up), eased key to key.
 */
export interface CrouchParams {
  downMs: number;
  scanKeys: readonly number[];
  scanMs: number;
  /** Scan window (ms into the scan) in which he is dead still: the breathing bob fades out. */
  freezeAtMs: number;
  freezeMs: number;
  peekRiseMs: number;
  peekHoldMs: number;
  peekSinkMs: number;
  glanceKeys: readonly number[];
  glanceMs: number;
  riseMs: number;
}

export interface DuckParams {
  downMs: number;
  holdMs: number;
  holdKeys: readonly number[];
  riseMs: number;
}

export interface ReturnParams {
  startMs: number;
  walkInMs: number;
  /** Walk-in velocity profile: ramp up over walkAccelMs, cruise, ramp down over walkDecelMs. */
  walkAccelMs: number;
  walkDecelMs: number;
  lookLeadMs: number;
  lookTurnMs: number;
  lookHoldMs: readonly number[];
  sneakCycleMs: number;
  sneakMinMs: number;
  /** Where along the tiptoe (share of the ground) he pauses to listen, how long he freezes, and the duck that follows (null = none). */
  sneakPauseAt: number;
  listenMs: number;
  duck: DuckParams | null;
  /** Standing at the C before the first stroke: a glance back (keys as the crouch's), the turn to the wall, the can shake. */
  plantGlanceMs: number;
  plantGlanceKeys: readonly number[];
  plantMs: number;
  shakeMs: number;
  shakeHz: number;
  commitMs: number;
  writeMs: number;
  liftMs: number;
  holdMs: number;
  /** After the last stroke and its pause: a few quiet tiptoe steps to `xHide` (bottom right of the calligraphy), then a slow crouch down that lasts hideCrouchMs and is held for ever. */
  hideCrouchMs: number;
  /** Walking to the next standing place while the nozzle is lifted (ms). */
  stepMs: number;
  /** Seed for the writing's human variation. */
  seed: number;
  /** Mid-word glance back: rest length (ms) at the end of a lift, and its head keys. */
  midGlanceMs: number;
  midGlanceKeys: readonly number[];
  /** Canvas x he enters from (off the right edge), where he stands to look, where he hides at the end. */
  xEnter: number;
  xLook: number;
  xHide: number;
  /** Canvas px of ground covered by one sneak cycle. */
  sneakCyclePx: number;
  /** Nozzle x minus body x for the reach poses: the smallest, the mean, the largest (canvas px). One standing place covers `reachHi - reachLo + 2 * reachAllow` of the word. */
  reachLo: number;
  reachMid: number;
  reachHi: number;
  /** How far past the pose library's range the upper body may lean to keep the nozzle on the pen (canvas px), and the most standing places allowed (the lean grows until it fits). */
  reachAllow: number;
  reachAllowMax: number;
  maxStands: number;
  crouch: CrouchParams | null;
}

export interface ReturnPlan {
  p: ReturnParams;
  write: WritePlan;
  /** The repositionings between standing places (pen lifted, a few walking steps). */
  steps: Step[];
  /** The standing places: which strokes each covers. */
  stands: StandGroup[];
  /** The lean allowance the word needed (canvas px). */
  allow: number;
  /** Body x when planted at the C. */
  xStart: number;
  xEnd: number;
  /** Absolute times (ms on the intro clock). */
  tWalkEnd: number;
  /** End of the standing look = start of the crouch (equal to tSneak0 when there is no crouch). */
  tLookEnd: number;
  tDownEnd: number;
  tScanEnd: number;
  tPeekEnd: number;
  tGlanceEnd: number;
  /** Start of the tiptoe (end of the rise out of the crouch). */
  tSneak0: number;
  /** The listen-pause on the tiptoe, and the duck (down, hold, up), all absolute. */
  tListen0: number;
  tListen1: number;
  tDuckDown1: number;
  tDuckHold1: number;
  tDuck1: number;
  tSneakEnd: number;
  /** Standing at the C: glance back ends, turn to the wall ends (start of the can shake). */
  tPlantGlanceEnd: number;
  tTurnEnd: number;
  tWrite0: number;
  tWrite1: number;
  tHoldEnd: number;
  /** End of the steps to the hiding place, and of the crouch (the last moment anything moves: the hero rests in the final crouched pose from here on). */
  tHideMove1: number;
  tEnd: number;
  /** ms into the writing of the mid-word glance (both 0 if none). */
  glance0: number;
  glance1: number;
  /** Times at which the pose set changes; the renderer crossfades from the outgoing pose (held at its last frame) over the sheet fade. */
  cuts: Float64Array;
  /** Ground covered by the tiptoe before / after the pause (canvas px), and the pause's x. */
  xPause: number;
}

const stepEase = (u: number): number => 0.4 * u + 0.6 * smooth(u);

export function planReturn(p: ReturnParams, pen: PenSampler): ReturnPlan {
  // where the pen goes, stroke by stroke, decides the standing places
  const ext: Array<{ a: number; b: number }> = [];
  const tmp: PenState = { x: 0, y: 0, down: false, stroke: 0 };
  for (let i = 0; i < pen.count; i++) {
    let a = Infinity;
    let b = -Infinity;
    const L = pen.lens[i] ?? 0;
    for (let k = 0; k <= 24; k++) {
      pen.sample(i, (L * k) / 24, tmp);
      a = Math.min(a, tmp.x);
      b = Math.max(b, tmp.x);
    }
    ext.push({ a, b });
  }
  let allow = p.reachAllow;
  let stands = planStands(ext, p.reachHi - p.reachLo + 2 * allow);
  // the lean grows up to reachAllowMax while the word needs more than maxStands places; past that the extra places stay (a bigger lean would bend him out of shape)
  for (let it = 0; stands.length > p.maxStands && allow < p.reachAllowMax && it < 60; it++) {
    allow = Math.min(p.reachAllowMax, allow + Math.max(1, (p.reachAllowMax - p.reachAllow) / 8));
    stands = planStands(ext, p.reachHi - p.reachLo + 2 * allow);
  }
  const standX = (g: StandGroup): number => (g.a + g.b) / 2 - p.reachMid;
  const xStart = stands[0] ? standX(stands[0]) : 0;

  // gaps: repositioning between standing places gets its own length; one mid-word gap rests for a glance back
  const n = pen.count;
  const gapMs: number[] = new Array<number>(Math.max(0, n - 1)).fill(0);
  const holdMs: number[] = new Array<number>(Math.max(0, n - 1)).fill(0);
  for (let j = 1; j < stands.length; j++) {
    const from = stands[j]?.from ?? 1;
    gapMs[from - 1] = p.stepMs;
  }
  let glanceGap = -1;
  for (let d = 0; d < n && glanceGap < 0; d++) {
    for (const g of [Math.floor(n / 2) - 1 + d, Math.floor(n / 2) - 1 - d]) if (glanceGap < 0 && g >= 0 && g < n - 1 && (gapMs[g] ?? 0) <= 0) glanceGap = g;
  }
  if (glanceGap >= 0 && p.midGlanceMs > 0) {
    gapMs[glanceGap] = Math.max(p.midGlanceMs + 240, 0);
    holdMs[glanceGap] = p.midGlanceMs;
  }
  const write = planWrite(pen.lens, p.writeMs, p.liftMs, { seed: p.seed, gapMs, holdMs, commitMs: p.commitMs });
  const steps: Step[] = [];
  for (let j = 1; j < stands.length; j++) {
    const g = stands[j];
    const prev = stands[j - 1];
    if (!g || !prev) continue;
    const i = g.from;
    steps.push({ t0: (write.t0[i] ?? 0) - (write.gap[i] ?? 0), t1: write.t0[i] ?? 0, from: standX(prev), to: standX(g) });
  }
  const glance0 = glanceGap >= 0 && p.midGlanceMs > 0 ? (write.t0[glanceGap + 1] ?? 0) - p.midGlanceMs : 0;
  const glance1 = glanceGap >= 0 && p.midGlanceMs > 0 ? write.t0[glanceGap + 1] ?? 0 : 0;

  const tWalkEnd = p.startMs + p.walkInMs;
  let lookMs = p.lookLeadMs;
  for (const h of p.lookHoldMs) lookMs += p.lookTurnMs + h;
  const tLookEnd = tWalkEnd + lookMs;
  const c = p.crouch;
  const tDownEnd = tLookEnd + (c ? c.downMs : 0);
  const tScanEnd = tDownEnd + (c ? c.scanMs : 0);
  const tPeekEnd = tScanEnd + (c ? c.peekRiseMs + c.peekHoldMs + c.peekSinkMs : 0);
  const tGlanceEnd = tPeekEnd + (c ? c.glanceMs : 0);
  const tSneak0 = tGlanceEnd + (c ? c.riseMs : 0);
  const movingMs = Math.max(p.sneakCyclePx > 0 ? (Math.abs(xStart - p.xLook) * p.sneakCycleMs) / p.sneakCyclePx : 0, p.sneakMinMs);
  const pauseAt = Math.min(0.95, Math.max(0.05, p.sneakPauseAt));
  const tListen0 = tSneak0 + movingMs * pauseAt;
  const tListen1 = tListen0 + p.listenMs;
  const d = p.duck;
  const tDuckDown1 = tListen1 + (d ? d.downMs : 0);
  const tDuckHold1 = tDuckDown1 + (d ? d.holdMs : 0);
  const tDuck1 = tDuckHold1 + (d ? d.riseMs : 0);
  const tSneakEnd = tDuck1 + movingMs * (1 - pauseAt);
  const tPlantGlanceEnd = tSneakEnd + p.plantGlanceMs;
  const tTurnEnd = tPlantGlanceEnd + p.plantMs;
  const tWrite0 = tTurnEnd + p.shakeMs;
  const tWrite1 = tWrite0 + write.totalMs;
  const tHoldEnd = tWrite1 + p.holdMs;
  const xEnd = bodyAt(steps, xStart, write.totalMs);
  const hideDist = Math.abs(p.xHide - xEnd);
  const tHideMove1 = tHoldEnd + (p.sneakCyclePx > 0 ? (hideDist * p.sneakCycleMs * 1.3) / p.sneakCyclePx : 0);
  const cutList: number[] = [tSneakEnd, tHoldEnd, tHideMove1];
  if (c) cutList.push(tLookEnd, tSneak0);
  if (d) cutList.push(tListen1, tDuck1);
  if (p.plantGlanceMs > 0) cutList.push(tPlantGlanceEnd);
  if (glance1 > glance0) cutList.push(tWrite0 + glance0, tWrite0 + glance1);
  cutList.sort((x, y) => x - y);
  return {
    p,
    write,
    steps,
    stands,
    allow,
    xStart,
    xEnd,
    tWalkEnd,
    tLookEnd,
    tDownEnd,
    tScanEnd,
    tPeekEnd,
    tGlanceEnd,
    tSneak0,
    tListen0,
    tListen1,
    tDuckDown1,
    tDuckHold1,
    tDuck1,
    tSneakEnd,
    tPlantGlanceEnd,
    tTurnEnd,
    tWrite0,
    tWrite1,
    tHoldEnd,
    tHideMove1,
    tEnd: tHideMove1 + p.hideCrouchMs,
    glance0,
    glance1,
    cuts: Float64Array.from(cutList),
    xPause: p.xLook + (xStart - p.xLook) * pauseAt,
  };
}

/** Yaw of the head 0..1 (0 forward, 1 fully back) at `t` ms into the look phase: lead, then turn/hold pairs alternating back, forward, back, forward. */
export function lookYaw(p: Pick<ReturnParams, "lookLeadMs" | "lookTurnMs" | "lookHoldMs">, t: number): number {
  if (t <= p.lookLeadMs) return 0;
  let r = t - p.lookLeadMs;
  let from = 0;
  for (let i = 0; i < p.lookHoldMs.length; i++) {
    const to = i % 2 === 0 ? 1 : 0;
    if (r < p.lookTurnMs) return from + (to - from) * smoother(r / p.lookTurnMs);
    r -= p.lookTurnMs;
    if (r < (p.lookHoldMs[i] ?? 0)) return to;
    r -= p.lookHoldMs[i] ?? 0;
    from = to;
  }
  return from;
}

/** Evaluate a flat `[t, yaw, pitch, ...]` key track at `t`: eased between keys, held before the first and after the last. Writes into `out` (no allocation). */
export function trackAt(keys: readonly number[], t: number, out: { yaw: number; pitch: number }): void {
  const n = Math.floor(keys.length / 3);
  out.yaw = 0;
  out.pitch = 0;
  if (n === 0) return;
  if (t <= (keys[0] ?? 0)) {
    out.yaw = keys[1] ?? 0;
    out.pitch = keys[2] ?? 0;
    return;
  }
  for (let i = 1; i < n; i++) {
    const t1 = keys[i * 3] ?? 0;
    if (t <= t1) {
      const t0 = keys[(i - 1) * 3] ?? 0;
      const f = t1 > t0 ? smoother((t - t0) / (t1 - t0)) : 1;
      const y0 = keys[(i - 1) * 3 + 1] ?? 0;
      const p0 = keys[(i - 1) * 3 + 2] ?? 0;
      out.yaw = y0 + ((keys[i * 3 + 1] ?? 0) - y0) * f;
      out.pitch = p0 + ((keys[i * 3 + 2] ?? 0) - p0) * f;
      return;
    }
  }
  out.yaw = keys[(n - 1) * 3 + 1] ?? 0;
  out.pitch = keys[(n - 1) * 3 + 2] ?? 0;
}

/** Fraction 0..1 through the peek (0 crouched low, 1 highest): rise, hold, sink. */
export function peekProfile(c: Pick<CrouchParams, "peekRiseMs" | "peekHoldMs" | "peekSinkMs">, t: number): number {
  if (t <= 0) return 0;
  if (t < c.peekRiseMs) return smooth(t / c.peekRiseMs);
  if (t < c.peekRiseMs + c.peekHoldMs) return 1;
  const u = (t - c.peekRiseMs - c.peekHoldMs) / c.peekSinkMs;
  return u >= 1 ? 0 : 1 - smooth(u);
}

export const MODE = { off: 0, walk: 1, look: 2, sneak: 3, write: 4, crouch: 6 } as const;
/** Sub-phases of MODE.crouch. */
export const CROUCH = { down: 0, scan: 1, peek: 2, glance: 3, rise: 4 } as const;

const tk = { yaw: 0, pitch: 0 };

export interface BodyState {
  mode: number;
  /** Body (hips) x in canvas px. */
  x: number;
  /** Faces screen-left when true. */
  mirrored: boolean;
  /** Ground covered in the current gait, px, for picking the cycle frame. */
  dist: number;
  /** Head yaw 0..1 (1 fully back): standing look, plant glance, mid-word glance, and the crouch head tracks. */
  yaw: number;
  /** ms into the writing (negative while planting and shaking the can). */
  wt: number;
  /** While writing: 0..1 progress of the turn to face the wall (< 1 while turning), whether he is walking to the next standing place, and the ground those steps have covered (px, for the gait frame). */
  turn: number;
  stepping: boolean;
  travelled: number;
  /** MODE.crouch: which CROUCH.* beat, and how deep: 0 standing .. 1 fully crouched (down/rise/duck), or the peek height 0..1. */
  cphase: number;
  depth: number;
  /** Head pitch -1..1 (positive up) in the crouch. */
  pitch: number;
  /** Weight 0..1 of the idle breathing bob (0 while frozen or moving). */
  breath: number;
  /** Can shake -1..1 (signed oscillation with an envelope), non-zero only in the beat before the first stroke. */
  shake: number;
  /** True while the head is turned back in a standing beat (plant glance, mid-word glance): draw the look sheet, feet as they are. */
  glance: boolean;
  /** 1 when this crouch is the duck (spooked) rather than the main crouch block. */
  duck: boolean;
}

/** Where the body is and what it is doing at `ti`. */
export function sampleReturn(plan: ReturnPlan, ti: number, out: BodyState): void {
  const p = plan.p;
  out.mode = MODE.off;
  out.mirrored = false;
  out.dist = 0;
  out.yaw = 0;
  out.wt = 0;
  out.turn = 1;
  out.stepping = false;
  out.travelled = 0;
  out.cphase = 0;
  out.depth = 0;
  out.pitch = 0;
  out.breath = 0;
  out.shake = 0;
  out.glance = false;
  out.duck = false;
  out.x = p.xEnter;
  if (ti < p.startMs) return;
  if (ti < plan.tWalkEnd) {
    // ramp up, cruise, ramp down: velocity trapezoid, so there is no brisk start and he eases to a stop
    const T = p.walkInMs;
    const a = Math.min(p.walkAccelMs, T / 2);
    const d = Math.min(p.walkDecelMs, T / 2);
    const v = 1 / (T - a / 2 - d / 2);
    const t = ti - p.startMs;
    const s = t < a ? (v * t * t) / (2 * a) : t < T - d ? (v * a) / 2 + v * (t - a) : 1 - (v * (T - t) * (T - t)) / (2 * d);
    out.mode = MODE.walk;
    out.mirrored = true;
    out.x = p.xEnter + (p.xLook - p.xEnter) * s;
    out.dist = Math.abs(out.x - p.xEnter);
    return;
  }
  if (ti < plan.tLookEnd) {
    out.mode = MODE.look;
    out.mirrored = true;
    out.x = p.xLook;
    out.yaw = lookYaw(p, ti - plan.tWalkEnd);
    return;
  }
  const c = p.crouch;
  if (c && ti < plan.tSneak0) {
    out.mode = MODE.crouch;
    out.mirrored = true;
    out.x = p.xLook;
    if (ti < plan.tDownEnd) {
      out.cphase = CROUCH.down;
      out.depth = smooth((ti - plan.tLookEnd) / c.downMs);
    } else if (ti < plan.tScanEnd) {
      const t = ti - plan.tDownEnd;
      out.cphase = CROUCH.scan;
      out.depth = 1;
      trackAt(c.scanKeys, t, tk);
      out.yaw = tk.yaw;
      out.pitch = tk.pitch;
      // dead still through the freeze: the breathing bob eases out and back in
      out.breath = 1 - smooth(Math.min((t - c.freezeAtMs) / 120, (c.freezeAtMs + c.freezeMs - t) / 120));
    } else if (ti < plan.tPeekEnd) {
      out.cphase = CROUCH.peek;
      out.depth = peekProfile(c, ti - plan.tScanEnd);
      trackAt(c.scanKeys, c.scanMs, tk);
      out.yaw = tk.yaw;
      out.pitch = tk.pitch;
    } else if (ti < plan.tGlanceEnd) {
      out.cphase = CROUCH.glance;
      out.depth = 1;
      trackAt(c.glanceKeys, ti - plan.tPeekEnd, tk);
      out.yaw = tk.yaw;
      out.pitch = tk.pitch;
      out.breath = 1;
    } else {
      out.cphase = CROUCH.rise;
      out.depth = 1 - smooth((ti - plan.tGlanceEnd) / c.riseMs);
    }
    return;
  }
  if (ti < plan.tSneakEnd) {
    out.mirrored = plan.xStart < p.xLook;
    const D = plan.tSneakEnd - plan.tSneak0 - (plan.tDuck1 - plan.tListen0);
    const pA = plan.tListen0 - plan.tSneak0;
    if (ti < plan.tListen0) {
      out.mode = MODE.sneak;
      out.x = p.xLook + (plan.xPause - p.xLook) * stepEase((ti - plan.tSneak0) / pA);
    } else if (ti < plan.tListen1 || ti < plan.tDuck1) {
      const dk = p.duck;
      out.x = plan.xPause;
      out.mirrored = true; // he freezes and ducks facing back the way he came
      if (ti < plan.tListen1) {
        // frozen on one foot, listening
        out.mode = MODE.sneak;
        out.mirrored = plan.xStart < p.xLook;
        out.breath = 1;
      } else if (dk) {
        out.mode = MODE.crouch;
        out.duck = true;
        if (ti < plan.tDuckDown1) {
          out.cphase = CROUCH.down;
          out.depth = smooth((ti - plan.tListen1) / dk.downMs);
        } else if (ti < plan.tDuckHold1) {
          out.cphase = CROUCH.scan;
          out.depth = 1;
          trackAt(dk.holdKeys, ti - plan.tDuckDown1, tk);
          out.yaw = tk.yaw;
          out.pitch = tk.pitch;
          out.breath = 1;
        } else {
          out.cphase = CROUCH.rise;
          out.depth = 1 - smooth((ti - plan.tDuckHold1) / dk.riseMs);
        }
      }
    } else {
      out.mode = MODE.sneak;
      const pB = D - pA;
      out.x = plan.xPause + (plan.xStart - plan.xPause) * stepEase((ti - plan.tDuck1) / pB);
    }
    if (out.mode === MODE.sneak) out.dist = Math.abs(out.x - p.xLook);
    return;
  }
  if (ti < plan.tPlantGlanceEnd) {
    // standing at the C, facing left, one last look back
    out.mode = MODE.look;
    out.mirrored = true;
    out.x = plan.xStart;
    trackAt(p.plantGlanceKeys, ti - plan.tSneakEnd, tk);
    out.yaw = tk.yaw;
    out.breath = 1;
    return;
  }
  if (ti < plan.tHoldEnd) {
    out.mode = MODE.write;
    out.wt = ti - plan.tWrite0;
    out.x = bodyAt(plan.steps, plan.xStart, Math.max(0, out.wt));
    out.turn = smooth((out.wt + p.shakeMs + p.plantMs) / p.plantMs);
    if (out.wt < 0 && out.turn >= 1) {
      const u = (out.wt + p.shakeMs) / p.shakeMs;
      out.shake = Math.sin(((out.wt + p.shakeMs) / 1000) * p.shakeHz * 6.2832) * Math.sin(Math.PI * clamp01(u));
    }
    if (out.wt >= plan.glance0 && out.wt < plan.glance1 && plan.glance1 > plan.glance0) {
      out.glance = true;
      trackAt(p.midGlanceKeys, out.wt - plan.glance0, tk);
      out.yaw = tk.yaw;
    }
    for (let i = 0; i < plan.steps.length; i++) {
      const s = plan.steps[i];
      if (!s || out.wt < s.t0) break;
      const f = smooth((out.wt - s.t0) / (s.t1 - s.t0));
      out.travelled += Math.abs(s.to - s.from) * f;
      if (out.wt < s.t1) out.stepping = true;
    }
    out.breath = out.wt < 0 || out.stepping ? 0 : 1;
    return;
  }
  // the ending: a few quiet steps to the hiding place, then down into a slow crouch, held for ever (no breathing, no exit)
  out.mirrored = true;
  if (ti < plan.tHideMove1) {
    out.mode = MODE.sneak;
    out.mirrored = p.xHide < plan.xEnd;
    out.x = plan.xEnd + (p.xHide - plan.xEnd) * stepEase((ti - plan.tHoldEnd) / (plan.tHideMove1 - plan.tHoldEnd));
    out.dist = Math.abs(out.x - plan.xEnd);
    return;
  }
  out.x = p.xHide;
  if (p.crouch) {
    out.mode = MODE.crouch;
    out.cphase = CROUCH.down;
    out.depth = smooth((ti - plan.tHideMove1) / p.hideCrouchMs);
  } else {
    out.mode = MODE.look; // no crouch sheets: he simply stands still there
  }
}
