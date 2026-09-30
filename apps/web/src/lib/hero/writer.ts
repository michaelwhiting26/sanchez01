/**
 * The return pass, as pure functions of time: walk in, look behind and ahead, tiptoe to the C, write "Custom" stroke by stroke, walk off.
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

export interface WritePlan {
  n: number;
  lens: ArrayLike<number>;
  /** Start and duration of each stroke, ms from the start of the writing. */
  t0: Float64Array;
  td: Float64Array;
  liftMs: number;
  totalMs: number;
}

/** Split `totalMs` over the strokes in proportion to their length, with a lift between strokes. */
export function planWrite(lens: ArrayLike<number>, totalMs: number, liftMs: number): WritePlan {
  const n = lens.length;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += lens[i] ?? 0;
  const lifts = Math.max(0, n - 1);
  const drawMs = Math.max(0, totalMs - lifts * liftMs);
  const t0 = new Float64Array(n);
  const td = new Float64Array(n);
  let t = 0;
  for (let i = 0; i < n; i++) {
    td[i] = sum > 0 ? (drawMs * (lens[i] ?? 0)) / sum : 0;
    t0[i] = t;
    t += (td[i] ?? 0) + (i < n - 1 ? liftMs : 0);
  }
  return { n, lens, t0, td, liftMs, totalMs };
}

/** Length of stroke `i` laid down at `t` ms into the writing. */
export function revealedLength(plan: WritePlan, t: number, i: number): number {
  const d = plan.td[i] ?? 0;
  const L = plan.lens[i] ?? 0;
  if (d <= 0) return t >= (plan.t0[i] ?? 0) ? L : 0;
  return L * strokeEase((t - (plan.t0[i] ?? 0)) / d);
}

export interface PenState extends Vec {
  /** True while the nozzle is on the wall laying paint. */
  down: boolean;
  /** Stroke in progress (or the one the nozzle is travelling to, in a lift). */
  stroke: number;
}

const sa: Vec = { x: 0, y: 0 };
const sb: Vec = { x: 0, y: 0 };

/** The nozzle at `t` ms into the writing: on the stroke head while a stroke is drawn, gliding off the wall to the next start in a lift. */
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
      const f = smooth((t - (plan.t0[prev] ?? 0) - (plan.td[prev] ?? 0)) / plan.liftMs);
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

// ------------------------------------------------------------------ shuffling along the word

export interface Step {
  t0: number;
  t1: number;
  from: number;
  to: number;
}

/** Body x at time `t` given the shuffle steps (sorted); the body holds still between steps. */
export function bodyAt(steps: readonly Step[], x0: number, t: number): number {
  let x = x0;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (!s || t < s.t0) break;
    x = t >= s.t1 ? s.to : s.from + (s.to - s.from) * smooth((t - s.t0) / (s.t1 - s.t0));
  }
  return x;
}

/**
 * Steps the body takes so the pen stays within `tol` of its comfortable reach (`reachMid` ahead of the body): when it drifts out, he
 * shuffles to where the pen will be by the end of the step. `penX(t)` is the pen's canvas x at `t` ms into the writing.
 */
export function planSteps(x0: number, penX: (t: number) => number, durMs: number, reachMid: number, tol: number, stepMs: number, dtMs = 20): Step[] {
  const steps: Step[] = [];
  let free = 0; // time the current step ends
  for (let t = 0; t <= durMs; t += dtMs) {
    if (t < free) continue;
    const body = bodyAt(steps, x0, t);
    const e = penX(t) - body - reachMid;
    if (Math.abs(e) > tol) {
      const to = penX(Math.min(durMs, t + stepMs)) - reachMid;
      steps.push({ t0: t, t1: t + stepMs, from: body, to });
      free = t + stepMs;
    }
  }
  return steps;
}

// ------------------------------------------------------------------ the whole return pass

export interface ReturnParams {
  startMs: number;
  walkInMs: number;
  lookLeadMs: number;
  lookTurnMs: number;
  lookHoldMs: readonly number[];
  sneakCycleMs: number;
  plantMs: number;
  writeMs: number;
  liftMs: number;
  holdMs: number;
  walkOutMs: number;
  stepMs: number;
  walkEaseExp: number;
  /** Canvas x he enters from (off the right edge), where he stands to look, where he leaves to. */
  xEnter: number;
  xLook: number;
  xExit: number;
  /** Canvas px of ground covered by one sneak cycle. */
  sneakCyclePx: number;
  /** Comfortable reach: nozzle x minus body x, and how far the pen may stray from it before he steps. */
  reachMid: number;
  reachTol: number;
}

export interface ReturnPlan {
  p: ReturnParams;
  write: WritePlan;
  steps: Step[];
  /** Body x when planted at the C. */
  xStart: number;
  xEnd: number;
  /** Absolute times (ms on the intro clock). */
  tWalkEnd: number;
  tLookEnd: number;
  tSneakEnd: number;
  tWrite0: number;
  tWrite1: number;
  tHoldEnd: number;
  tEnd: number;
}

export function planReturn(p: ReturnParams, pen: PenSampler): ReturnPlan {
  const write = planWrite(pen.lens, p.writeMs, p.liftMs);
  const s0: Vec = { x: 0, y: 0 };
  pen.sample(0, 0, s0);
  const xStart = s0.x - p.reachMid;
  const tmp: PenState = { x: 0, y: 0, down: false, stroke: 0 };
  const steps = planSteps(
    xStart,
    (t) => {
      penAt(write, pen, t, tmp);
      return tmp.x;
    },
    write.totalMs,
    p.reachMid,
    p.reachTol,
    p.stepMs,
  );
  const tWalkEnd = p.startMs + p.walkInMs;
  let lookMs = p.lookLeadMs;
  for (const h of p.lookHoldMs) lookMs += p.lookTurnMs + h;
  const tLookEnd = tWalkEnd + lookMs;
  const sneakMs = p.sneakCyclePx > 0 ? (Math.abs(xStart - p.xLook) * p.sneakCycleMs) / p.sneakCyclePx : 0;
  const tSneakEnd = tLookEnd + sneakMs;
  const tWrite0 = tSneakEnd + p.plantMs;
  const tWrite1 = tWrite0 + write.totalMs;
  const tHoldEnd = tWrite1 + p.holdMs;
  const xEnd = bodyAt(steps, xStart, write.totalMs);
  return { p, write, steps, xStart, xEnd, tWalkEnd, tLookEnd, tSneakEnd, tWrite0, tWrite1, tHoldEnd, tEnd: tHoldEnd + p.walkOutMs };
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

export const MODE = { off: 0, walk: 1, look: 2, sneak: 3, write: 4, out: 5 } as const;

export interface BodyState {
  mode: number;
  /** Body (hips) x in canvas px. */
  x: number;
  /** Faces screen-left when true. */
  mirrored: boolean;
  /** Ground covered in the current gait, px, for picking the cycle frame. */
  dist: number;
  yaw: number;
  /** ms into the writing (negative while planting). */
  wt: number;
}

/** Where the body is and what it is doing at `ti`. */
export function sampleReturn(plan: ReturnPlan, ti: number, out: BodyState): void {
  const p = plan.p;
  out.mode = MODE.off;
  out.mirrored = false;
  out.dist = 0;
  out.yaw = 0;
  out.wt = 0;
  out.x = p.xEnter;
  if (ti < p.startMs || ti > plan.tEnd) return;
  if (ti < plan.tWalkEnd) {
    const u = (ti - p.startMs) / p.walkInMs;
    const e = 1 - (1 - u) ** p.walkEaseExp;
    out.mode = MODE.walk;
    out.mirrored = true;
    out.x = p.xEnter + (p.xLook - p.xEnter) * e;
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
  if (ti < plan.tSneakEnd) {
    const u = (ti - plan.tLookEnd) / (plan.tSneakEnd - plan.tLookEnd);
    const e = 0.4 * u + 0.6 * smooth(u);
    out.mode = MODE.sneak;
    out.mirrored = plan.xStart < p.xLook;
    out.x = p.xLook + (plan.xStart - p.xLook) * e;
    out.dist = Math.abs(out.x - p.xLook);
    return;
  }
  if (ti < plan.tHoldEnd) {
    out.mode = MODE.write;
    out.wt = ti - plan.tWrite0;
    out.x = bodyAt(plan.steps, plan.xStart, out.wt);
    return;
  }
  const u = (ti - plan.tHoldEnd) / p.walkOutMs;
  out.mode = MODE.out;
  out.x = plan.xEnd + (p.xExit - plan.xEnd) * u * u;
  out.dist = out.x - plan.xEnd;
}
