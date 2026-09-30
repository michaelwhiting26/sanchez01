import { INTRO, SPRAY, type Rgb } from "./config";
import type { SigPen } from "./sigpen";
import { CROUCH, MODE, penAt, planReturn, revealedLength, sampleReturn, type BodyState, type CrouchParams, type PenState, type ReturnPlan, type Vec } from "./writer";

export interface LetterBox {
  /** Grid units: centre column and the top and bottom rows of the letter. */
  cx: number;
  top: number;
  bottom: number;
}

/** Split the letter mask into its letters by empty columns. Falls back to equal parts if the count is not `expected`. Pure. */
export function segmentLetters(letters: Uint8Array, mw: number, mh: number, expected = 7): LetterBox[] {
  const colCount = new Uint16Array(mw);
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) if (letters[y * mw + x]) colCount[x] = (colCount[x] ?? 0) + 1;
  const runs: Array<[number, number]> = [];
  let start = -1;
  for (let x = 0; x <= mw; x++) {
    const on = x < mw && (colCount[x] ?? 0) > 0;
    if (on && start < 0) start = x;
    if (!on && start >= 0) {
      const last = runs[runs.length - 1];
      if (last && start - last[1] < 3) last[1] = x - 1;
      else runs.push([start, x - 1]);
      start = -1;
    }
  }
  let spans = runs;
  if (spans.length !== expected && runs.length) {
    const lo = runs[0]?.[0] ?? 0;
    const hi = runs[runs.length - 1]?.[1] ?? mw - 1;
    const w = (hi - lo + 1) / expected;
    spans = Array.from({ length: expected }, (_, i) => [Math.round(lo + i * w), Math.round(lo + (i + 1) * w - 1)] as [number, number]);
  }
  return spans.map(([a, b]) => {
    let top = mh;
    let bottom = 0;
    for (let y = 0; y < mh; y++) for (let x = a; x <= b; x++) if (letters[y * mw + x]) { if (y < top) top = y; if (y > bottom) bottom = y; }
    return { cx: (a + b) / 2, top, bottom };
  });
}

export interface IntroGeom {
  cell: number;
  ox: number;
  r0: number;
  sy0: number;
  cw: number;
  ch: number;
  mw: number;
  mh: number;
  sx0: number;
  sx1: number;
  slope: number;
  psmax: number;
  /** Flag colour at normalised (u, v), for the spray mist. */
  colourAt: (u: number, v: number) => Rgb;
  /** The "Custom" signature's box in canvas pixels and its pen (the strokes in screen space), or null. `key` changes when the geometry does. */
  sig: { left: number; right: number; y: number; key: string; pen: SigPen } | null;
}

interface Atlas {
  img: HTMLImageElement;
  frames: number;
  cols: number;
  w: number;
  h: number;
}
/** A gait / look sheet: frames on a grid, the hips (horizontal anchor), the foot baseline, and the ground covered per cycle (sprite px). */
interface Sheet {
  img: HTMLImageElement;
  frames: number;
  cols: number;
  size: number;
  hipsX: number;
  hipsY: number;
  footY: number;
  pxPerCycle: number;
  /** A lit colour render (draw as-is: no glow pass). */
  shaded: boolean;
  /** Per-frame hips x (crouch sheets), head yaw / pitch in degrees (crouchlook), and their largest magnitudes; null when the sheet has none. */
  hipsList: Float32Array | null;
  yaw: Float32Array | null;
  pitch: Float32Array | null;
  maxYaw: number;
  maxPitch: number;
}
/** The standing spray poses: per pose its frame, nozzle and hips (sprite px). */
interface ReachSheet {
  img: HTMLImageElement;
  cols: number;
  size: number;
  footY: number;
  n: number;
  frame: Int32Array;
  nx: Float32Array;
  ny: Float32Array;
  hx: Float32Array;
  hy: Float32Array;
  shaded: boolean;
}
interface RunnerMeta {
  frames: number;
  size: number;
  cols: number;
  nozzle: Array<{ x: number; y: number }>;
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
/** Deterministic per-bag / per-puff randomness in [0, 1). */
const vr = (i: number, k: number): number => {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
/** The same shaping as the spray front in the engine. */
const eOut = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c) * 0.35 + c * 0.65;
};

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const finite = (v: unknown, d: number): number => (typeof v === "number" && Number.isFinite(v) ? v : d);
const pt = (v: unknown): { x: number; y: number } | null => (isObj(v) && typeof v["x"] === "number" && typeof v["y"] === "number" ? { x: v["x"], y: v["y"] } : null);

/** The runner's own foot baseline and hips in sprite px (measured from runner.webp: the lowest opaque row, and the body's centre). */
const RUN_FOOT = 293;
const RUN_HIPS = { x: 165, y: 170 };

/** Fetch `<base>.webp` + `<base>.json`; null on any failure (missing file, bad JSON, wrong shape). */
async function loadPair(base: string): Promise<{ img: HTMLImageElement; meta: Record<string, unknown> } | null> {
  try {
    const [img, res] = await Promise.all([loadImage(`${base}.webp`), fetch(`${base}.json`).catch(() => null)]);
    if (!img || !res || !res.ok) return null;
    const meta: unknown = await res.json();
    return isObj(meta) ? { img, meta } : null;
  } catch {
    return null;
  }
}

const numArr = (v: unknown, key: "x" | "y" | null): Float32Array | null => {
  if (!Array.isArray(v) || !v.length) return null;
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) {
    const e: unknown = v[i];
    const n = key === null ? e : isObj(e) ? e[key] : undefined;
    if (typeof n !== "number" || !Number.isFinite(n)) return null;
    out[i] = n;
  }
  return out;
};
const maxAbs = (a: Float32Array | null): number => {
  let m = 0;
  if (a) for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] ?? 0));
  return m;
};

async function loadSheet(base: string, shaded = false): Promise<Sheet | null> {
  const p = await loadPair(base);
  if (!p) return null;
  const { img, meta } = p;
  const size = finite(meta["size"], 320);
  const frames = Math.max(1, Math.floor(finite(meta["frames"], 0)));
  const cols = Math.max(1, Math.floor(finite(meta["cols"], 4)));
  const hipsList = numArr(meta["hips"], "x");
  const hips = pt(meta["hips"]);
  if (frames < 1 || size <= 0 || img.naturalWidth < size) return null;
  const yaw = numArr(meta["yawDeg"], null);
  const pitch = numArr(meta["pitchDeg"], null);
  return { img, frames, cols, size, hipsX: hips?.x ?? hipsList?.[0] ?? size / 2, hipsY: hips?.y ?? RUN_HIPS.y, footY: finite(meta["footY"], RUN_FOOT), pxPerCycle: finite(meta["pxPerCycle"], 0.95 * size), shaded, hipsList, yaw, pitch, maxYaw: maxAbs(yaw), maxPitch: maxAbs(pitch) };
}

/** The shaded sheet (`<base>_shaded`) when INTRO.look asks for it and it exists, else the silhouette sheet. */
async function loadPref<T>(base: string, load: (b: string, shaded: boolean) => Promise<T | null>): Promise<T | null> {
  if (INTRO.look === "shaded") {
    const s = await load(`${base}_shaded`, true);
    if (s) return s;
  }
  return load(base, false);
}

async function loadReach(base: string, shaded = false): Promise<ReachSheet | null> {
  const p = await loadPair(base);
  if (!p) return null;
  const { img, meta } = p;
  const poses = meta["poses"];
  if (!Array.isArray(poses) || !poses.length) return null;
  const n = poses.length;
  const r: ReachSheet = { img, cols: Math.max(1, Math.floor(finite(meta["cols"], 5))), size: finite(meta["size"], 320), footY: finite(meta["footY"], RUN_FOOT), n, frame: new Int32Array(n), nx: new Float32Array(n), ny: new Float32Array(n), hx: new Float32Array(n), hy: new Float32Array(n), shaded };
  for (let i = 0; i < n; i++) {
    const q: unknown = poses[i];
    if (!isObj(q)) return null;
    const nz = pt(q["nozzle"]);
    const hp = pt(q["hips"]);
    if (!nz || !hp) return null;
    r.frame[i] = Math.floor(finite(q["i"], i));
    r.nx[i] = nz.x;
    r.ny[i] = nz.y;
    r.hx[i] = hp.x;
    r.hy[i] = hp.y;
  }
  return r;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function newBody(): BodyState {
  return { mode: 0, x: 0, mirrored: false, dist: 0, yaw: 0, wt: 0, turn: 1, stepping: false, travelled: 0, cphase: 0, depth: 0, pitch: 0, breath: 0, shake: 0, glance: false, duck: false };
}

/** The bag silhouettes and the two runners, drawn on top of the field. All motion is a pure function of time, so a frozen time gives a frozen frame. */
export class IntroSprites {
  private runner: (Atlas & { nozzleX: number; nozzleY: number; nozzles: Array<{ x: number; y: number }> }) | null = null;
  private bag: Atlas | null = null;
  private letters: LetterBox[] = [];
  // the return pass's sheets; any that fail to load stay null and the runner's own frames stand in
  private walk: Sheet | null = null;
  private look: Sheet | null = null;
  private sneak: Sheet | null = null;
  private reach: ReachSheet | null = null;
  private crouch: Sheet | null = null;
  private crouchLook: Sheet | null = null;
  private crouchPeek: Sheet | null = null;
  private runnerShaded = false;
  private plan: ReturnPlan | null = null;
  private planKey = "";
  private planCw = 0;
  private planSize = 0;
  private planFlags = -1;
  private readonly body: BodyState = newBody();
  private readonly bodyOld: BodyState = newBody();
  /** Alpha factor for the pose being drawn (the sheet crossfade). */
  private ga = 1;
  private readonly penNow: PenState = { x: 0, y: 0, down: false, stroke: 0 };
  private readonly penOld: PenState = { x: 0, y: 0, down: false, stroke: 0 };
  private readonly tmpV: Vec = { x: 0, y: 0 };

  async load(letters: LetterBox[]): Promise<boolean> {
    this.letters = letters;
    // the run sheet: the shaded render (run_shaded) when asked for and present, else the silhouette
    let runnerShaded: { img: HTMLImageElement; meta: RunnerMeta } | null = null;
    if (INTRO.look === "shaded") {
      const p = await loadPair(INTRO.assets.runnerShaded);
      const m = p?.meta;
      if (p && m && Array.isArray(m["nozzle"]) && typeof m["frames"] === "number" && typeof m["cols"] === "number" && typeof m["size"] === "number") runnerShaded = { img: p.img, meta: m as unknown as RunnerMeta };
    }
    this.runnerShaded = runnerShaded !== null;
    const [rImg0, bImg, rMeta0, bMeta] = await Promise.all([
      runnerShaded ? Promise.resolve(runnerShaded.img) : loadImage(INTRO.assets.runner),
      loadImage(INTRO.assets.bag),
      runnerShaded ? Promise.resolve(runnerShaded.meta) : fetch(INTRO.assets.runnerMeta).then((r) => r.json() as Promise<RunnerMeta>).catch(() => null),
      fetch(INTRO.assets.bagMeta).then((r) => r.json() as Promise<{ frames: number; w: number; h: number; cols: number }>).catch(() => null),
    ]);
    const rImg = rImg0;
    const rMeta = rMeta0;
    if (!rImg || !bImg || !rMeta || !bMeta) return false;
    const n = rMeta.nozzle.length || 1;
    // the can bobs with the arm; the body should not, so the sprite is anchored on the mean nozzle position
    const nozzleX = rMeta.nozzle.reduce((a, p) => a + p.x, 0) / n;
    const nozzleY = rMeta.nozzle.reduce((a, p) => a + p.y, 0) / n;
    this.runner = { img: rImg, frames: rMeta.frames, cols: rMeta.cols, w: rMeta.size, h: rMeta.size, nozzleX, nozzleY, nozzles: rMeta.nozzle };
    this.bag = { img: bImg, frames: bMeta.frames, cols: bMeta.cols, w: bMeta.w, h: bMeta.h };
    // the return pass's sheets load in the background during the first pass; each is optional
    void loadPref(INTRO.assets.walk, loadSheet).then((s) => (this.walk = s));
    void loadPref(INTRO.assets.look, loadSheet).then((s) => (this.look = s));
    void loadPref(INTRO.assets.sneak, loadSheet).then((s) => (this.sneak = s));
    void loadPref(INTRO.assets.reach, loadReach).then((s) => (this.reach = s));
    void loadPref(INTRO.assets.crouch, loadSheet).then((s) => (this.crouch = s));
    void loadPref(INTRO.assets.crouchLook, loadSheet).then((s) => (this.crouchLook = s));
    void loadPref(INTRO.assets.crouchPeek, loadSheet).then((s) => (this.crouchPeek = s));
    return true;
  }

  /** Letter centres in grid units and the time each bag lands, for the field's landing ripples. */
  landings(): Array<{ cx: number; cy: number; at: number }> {
    return this.letters.map((l, i) => ({ cx: l.cx, cy: (l.top + l.bottom) / 2, at: INTRO.bagsStartMs + i * INTRO.bagStaggerMs + (vr(i, 5) - 0.5) * 70 + INTRO.bagDurMs * 0.86 }));
  }

  /**
   * How far the spray-can nozzle sits from the sprite's anchor (the mean nozzle) at canvas x `xPx`, in canvas px: the arm's natural bob for the run-cycle frame he is in.
   * Writes into `out` (no allocation). Returns false (and zeros) until the sprite is loaded.
   */
  nozzleOffset(xPx: number, g: Pick<IntroGeom, "cell" | "mh" | "ch">, out: { x: number; y: number }): boolean {
    const r = this.runner;
    out.x = 0;
    out.y = 0;
    if (!r || !r.nozzles.length) return false;
    const spriteS = Math.max(this.letterHeightPx(g) * INTRO.runnerScale, g.ch * INTRO.runnerMinShare);
    const raw = Math.floor((xPx / (spriteS * 0.95)) * r.frames);
    const frame = ((raw % r.frames) + r.frames) % r.frames;
    const nz = r.nozzles[frame] ?? r.nozzles[0];
    if (!nz) return false;
    const k = spriteS / r.w;
    out.x = (nz.x - r.nozzleX) * k;
    out.y = (nz.y - r.nozzleY) * k;
    return true;
  }

  draw(ctx: CanvasRenderingContext2D, ti: number, g: IntroGeom): void {
    this.drawBags(ctx, ti, g);
    this.drawRunners(ctx, ti, g);
  }

  private letterHeightPx(g: Pick<IntroGeom, "cell" | "mh">): number {
    let top = g.mh;
    let bottom = 0;
    for (const l of this.letters) {
      if (l.top < top) top = l.top;
      if (l.bottom > bottom) bottom = l.bottom;
    }
    return Math.max(1, (bottom - top) * g.cell);
  }

  private drawBags(ctx: CanvasRenderingContext2D, ti: number, g: IntroGeom): void {
    const bag = this.bag;
    if (!bag || ti > INTRO.settleStartMs + INTRO.settleMs) return;
    const fade = 1 - clamp01((ti - INTRO.settleStartMs) / INTRO.settleMs);
    const bagH = this.letterHeightPx(g) * 1.12;
    const bagW = (bagH * bag.w) / bag.h;
    this.letters.forEach((l, i) => {
      // every bag is its own: size, spin count and direction, where it drifts in from, and when it drops
      const sz = 0.9 + 0.2 * vr(i, 1);
      const spins = 1.1 + 1.3 * vr(i, 2);
      const dir = vr(i, 3) < 0.5 ? 1 : -1;
      const drift = (vr(i, 4) - 0.5) * this.letterHeightPx(g) * 1.1;
      const p = clamp01((ti - INTRO.bagsStartMs - i * INTRO.bagStaggerMs - (vr(i, 5) - 0.5) * 70) / INTRO.bagDurMs);
      if (p <= 0) return;
      const q = p - 1;
      const e = 1 + 2.4 * q * q * q + 1.6 * q * q; // ease-out-back: lands, dips past its mark, settles
      const cx = g.ox + (l.cx + 0.5) * g.cell + drift * (1 - p) * (1 - p);
      const cy = g.r0 * g.cell - g.sy0 + ((l.top + l.bottom) / 2) * g.cell;
      const h = bagH * sz;
      const w = bagW * sz;
      const y = -h + (cy + h) * e;
      const turns = spins * (1 - p) ** 1.4; // fast, then easing to the side-on frame as it lands
      const raw = Math.floor(turns * bag.frames) % bag.frames;
      const frame = dir > 0 ? raw : (bag.frames - raw) % bag.frames;
      ctx.globalAlpha = fade * Math.min(1, p * 4);
      ctx.drawImage(bag.img, (frame % bag.cols) * bag.w, Math.floor(frame / bag.cols) * bag.h, bag.w, bag.h, cx - w / 2, y - h / 2, w, h);
    });
    ctx.globalAlpha = 1;
  }

  /** Nozzle x in canvas px for a runner spraying at grid row `row`, or null when off the stage. */
  private frontRunnerX(ti: number, g: IntroGeom, row: number, spriteS: number): number | null {
    const tp = ti - INTRO.sprayStartMs;
    const cellsPerPx = 1 / g.cell;
    const span = g.psmax + 24;
    const v0 = (0.65 * span) / (SPRAY.durationMs / 1000); // cells per second, the front's speed at the start and the end
    const grid = (F: number): number => g.ox + (g.sx0 + F - g.slope * row + 0.5) * g.cell;
    let F: number;
    if (tp < 0) {
      if (tp < -INTRO.runnerEnterMs) return null;
      const offF = (-(spriteS * 1.2) - g.ox) * cellsPerPx - g.sx0 + g.slope * row - 0.5;
      const D = -8 - offF;
      const s = tp / 1000;
      const k = (D - v0 * (INTRO.runnerEnterMs / 1000)) / (INTRO.runnerEnterMs / 1000) ** 2;
      F = -8 + v0 * s - k * s * s;
    } else if (tp <= SPRAY.durationMs) {
      F = -8 + span * eOut(tp / SPRAY.durationMs);
    } else {
      const u = (tp - SPRAY.durationMs) / 1000;
      if (u > INTRO.runOffMs / 1000 + 0.05) return null;
      const Fend = -8 + span;
      const offF = (g.cw - g.ox + spriteS * 1.2) * cellsPerPx - g.sx0 + g.slope * row - 0.5;
      const a = Math.max(0, 2 * (offF - Fend - v0 * (INTRO.runOffMs / 1000)) / (INTRO.runOffMs / 1000) ** 2);
      F = Fend + v0 * u + 0.5 * a * u * u;
    }
    return grid(F);
  }

  private drawRunnerAt(ctx: CanvasRenderingContext2D, x: number, y: number, spriteS: number, mirrored: boolean, squash = 0): void {
    const r = this.runner;
    if (!r) return;
    const cycle = spriteS * 0.95;
    const raw = Math.floor(((mirrored ? -x : x) / cycle) * r.frames);
    const frame = ((raw % r.frames) + r.frames) % r.frames;
    const k = spriteS / r.w;
    ctx.save();
    ctx.translate(x, y);
    if (mirrored) ctx.scale(-1, 1);
    if (squash > 0) {
      ctx.rotate(-0.07 * squash); // the crouch and lean as he sets himself to spray
      ctx.scale(1 + 0.03 * squash, 1 - 0.08 * squash);
    }
    if (!this.runnerShaded) {
      ctx.shadowColor = "rgba(232,168,90,0.55)"; // a soft amber edge light so the black body separates from the dark ground
      ctx.shadowBlur = spriteS * 0.05;
    }
    ctx.drawImage(r.img, (frame % r.cols) * r.w, Math.floor(frame / r.cols) * r.h, r.w, r.h, -r.nozzleX * k, -r.nozzleY * k, spriteS, spriteS);
    ctx.restore();
  }

  private drawRunners(ctx: CanvasRenderingContext2D, ti: number, g: IntroGeom): void {
    if (!this.runner) return;
    const Lh = this.letterHeightPx(g);
    const spriteS = Math.max(Lh * INTRO.runnerScale, g.ch * INTRO.runnerMinShare);
    const top = Math.min(...this.letters.map((l) => l.top));
    const rowsPx = (row: number): number => g.r0 * g.cell - g.sy0 + row * g.cell;
    const rowAt = (share: number): number => top + share * (Lh / g.cell);
    const row = rowAt(INTRO.row);
    const x = this.frontRunnerX(ti, g, row, spriteS);
    const yRow = rowsPx(row);
    const tp = ti - INTRO.sprayStartMs;
    const bump = (t: number, a: number, b: number): number => (t > a && t < b ? Math.sin(((t - a) / (b - a)) * Math.PI) ** 2 : 0);
    // lingering spray mist behind him once the pass is done: it hangs and thins after he has gone
    if (tp > SPRAY.durationMs - 150) this.drawMist(ctx, (t) => this.frontRunnerX(t, g, row, spriteS), ti, yRow, spriteS, () => g.colourAt(0.55, 0.5));
    if (x !== null) this.drawRunnerAt(ctx, x, yRow, spriteS, false, bump(tp, -260, 220));
    if (g.sig) this.drawReturn(ctx, ti, g, spriteS);
  }

  // ------------------------------------------------------------------ the return pass

  private runSheet: Sheet | null = null;
  private runReach: ReachSheet | null = null;

  /** The runner's own run frames as a gait sheet: the stand-in for walk and sneak (and, frozen on frame 0, look) when their sheets are missing. */
  private fallbackSheet(): Sheet | null {
    const r = this.runner;
    if (!r) return null;
    this.runSheet ??= { img: r.img, frames: r.frames, cols: r.cols, size: r.w, hipsX: RUN_HIPS.x, hipsY: RUN_HIPS.y, footY: RUN_FOOT, pxPerCycle: 0.95 * r.w, shaded: this.runnerShaded, hipsList: null, yaw: null, pitch: null, maxYaw: 0, maxPitch: 0 };
    return this.runSheet;
  }

  /** The spray poses: the real reach sheet, or the runner's first frame as a single pose (the sprite is then simply carried to the pen). */
  private reachSheet(): ReachSheet | null {
    if (this.reach) return this.reach;
    const r = this.runner;
    const nz = r?.nozzles[0];
    if (!r || !nz) return null;
    this.runReach ??= { img: r.img, cols: r.cols, size: r.w, footY: RUN_FOOT, n: 1, frame: Int32Array.of(0), nx: Float32Array.of(nz.x), ny: Float32Array.of(nz.y), hx: Float32Array.of(RUN_HIPS.x), hy: Float32Array.of(RUN_HIPS.y), shaded: this.runnerShaded };
    return this.runReach;
  }

  /** The return pass's timeline for this geometry (built once per layout). Null until the sprites and the signature exist. */
  returnPlan(g: IntroGeom): ReturnPlan | null {
    const sig = g.sig;
    const r = this.runner;
    const walk = this.walk ?? this.fallbackSheet();
    const sneak = this.sneak ?? this.fallbackSheet();
    const reach = this.reachSheet();
    if (!sig || !r || !walk || !sneak || !reach) return null;
    const spriteS = this.spriteSize(g);
    const crouchOn = !!(this.crouch && this.crouchLook && this.crouchPeek);
    const flags = (this.walk ? 1 : 0) + (this.sneak ? 2 : 0) + (this.reach ? 4 : 0) + (crouchOn ? 8 : 0);
    const size = Math.round(spriteS);
    if (this.plan && sig.key === this.planKey && g.cw === this.planCw && size === this.planSize && flags === this.planFlags) return this.plan;
    const k = spriteS / r.w;
    let mid = 0;
    let lo = 1e9;
    let hi = -1e9;
    for (let i = 0; i < reach.n; i++) {
      const d = ((reach.nx[i] ?? 0) - (reach.hx[i] ?? 0)) * k;
      mid += d / reach.n;
      lo = Math.min(lo, d);
      hi = Math.max(hi, d);
    }
    const cr: CrouchParams | null = crouchOn ? INTRO.crouch : null;
    this.plan = planReturn(
      {
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
        duck: crouchOn ? INTRO.duck : null,
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
        xEnter: g.cw + spriteS * 0.7,
        xLook: 0, // set below, once the first standing place is known
        xHide: 0,
        sneakCyclePx: sneak.pxPerCycle * k,
        reachLo: lo,
        reachMid: mid,
        reachHi: hi,
        reachAllow: INTRO.reachAllowShare * spriteS,
        reachAllowMax: INTRO.reachAllowMaxShare * spriteS,
        maxStands: INTRO.maxStands,
        crouch: cr,
      },
      sig.pen,
    );
    // where he stands to look depends on where the first standing place is: re-plan with it (cheap, once per layout)
    const xLook = Math.min(this.plan.xStart + INTRO.lookAheadShare * spriteS, g.cw - spriteS * 0.5);
    const xHide = Math.min(sig.right - INTRO.hideInsetShare * spriteS, g.cw - spriteS * 0.3);
    this.plan = planReturn({ ...this.plan.p, xLook, xHide }, sig.pen);
    this.planKey = sig.key;
    this.planCw = g.cw;
    this.planSize = size;
    this.planFlags = flags;
    return this.plan;
  }

  /** Where he ends up hiding, in canvas px: feet position, sprite height, and whether he faces left. Null until the plan exists. */
  hideSpot(g: IntroGeom): { x: number; y: number; size: number; facingLeft: boolean } | null {
    const plan = this.returnPlan(g);
    const r = this.runner;
    const sig = g.sig;
    if (!plan || !r || !sig) return null;
    const k = this.spriteSize(g) / r.w;
    return { x: plan.p.xHide, y: sig.y + (RUN_FOOT - r.nozzleY) * k, size: this.spriteS, facingLeft: true };
  }

  /** Reduced motion: only the final pose, hiding at the bottom right of the calligraphy. */
  drawHidden(ctx: CanvasRenderingContext2D, g: IntroGeom): void {
    const plan = this.returnPlan(g);
    const r = this.runner;
    const sig = g.sig;
    if (!plan || !r || !sig) return;
    const spriteS = this.spriteSize(g);
    const k = spriteS / r.w;
    const b = this.body;
    sampleReturn(plan, plan.tEnd + 1, b);
    ctx.save();
    ctx.shadowColor = "rgba(232,168,90,0.55)";
    ctx.shadowBlur = spriteS * 0.05;
    this.ga = 1;
    this.drawBody(ctx, plan, b, plan.tEnd + 1, sig, k, sig.y + (RUN_FOOT - r.nozzleY) * k);
    ctx.restore();
  }

  /** Length of each signature stroke laid down at `ti` (svg units, into `len`), and how filled-in it is 0..1 (into `fill`: it fills only once its stroke is finished, so no ink shows ahead of the nozzle). False until the plan exists. */
  inkAt(ti: number, len: Float64Array, fill: Float64Array): boolean {
    const plan = this.plan;
    if (!plan) return false;
    const w = plan.write;
    for (let i = 0; i < w.n && i < len.length; i++) {
      const t = ti - plan.tWrite0;
      len[i] = revealedLength(w, t, i);
      fill[i] = Math.min(1, Math.max(0, (t - (w.t0[i] ?? 0) - (w.td[i] ?? 0)) / INTRO.fillMs));
    }
    return true;
  }

  private spriteS = 0;
  private spriteSize(g: IntroGeom): number {
    this.spriteS = Math.max(this.letterHeightPx(g) * INTRO.runnerScale, g.ch * INTRO.runnerMinShare);
    return this.spriteS;
  }

  private blitSheet(ctx: CanvasRenderingContext2D, s: Sheet, frame: number, x: number, gy: number, k: number, mirrored: boolean, sx = 1, dy = 0, hipsX = s.hipsX): void {
    const f = ((Math.round(frame) % s.frames) + s.frames) % s.frames;
    ctx.save();
    if (s.shaded) ctx.shadowColor = "rgba(0,0,0,0)"; // lit renders are drawn as they are
    ctx.globalAlpha = this.ga;
    ctx.translate(x, gy + dy);
    ctx.scale(mirrored ? -sx : sx, 1);
    ctx.drawImage(s.img, (f % s.cols) * s.size, Math.floor(f / s.cols) * s.size, s.size, s.size, -hipsX * k, -s.footY * k, s.size * k, s.size * k);
    ctx.restore();
  }

  /** The crouchlook frame whose head yaw (0..1 of its range) and pitch (-1..1 of its range) are nearest the target. */
  private headFrame(s: Sheet, yaw: number, pitch: number): number {
    if (!s.yaw) return Math.round(yaw * (s.frames - 1));
    const ty = yaw * s.maxYaw;
    const tp = pitch * s.maxPitch;
    const wy = 1 / Math.max(1, s.maxYaw);
    const wp = s.pitch && s.maxPitch > 0 ? 1 / s.maxPitch : 0;
    let best = 0;
    let bd = 1e18;
    for (let i = 0; i < s.frames; i++) {
      const dy = ((s.yaw[i] ?? 0) - ty) * wy;
      const dp = s.pitch ? ((s.pitch[i] ?? 0) - tp) * wp : 0;
      const d = dy * dy + dp * dp;
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return best;
  }

  /** One body state, drawn with feet on `ground`. Used twice while a sheet crossfades (outgoing at its last frame, incoming fading in). */
  private drawBody(ctx: CanvasRenderingContext2D, plan: ReturnPlan, b: BodyState, ti: number, sig: NonNullable<IntroGeom["sig"]>, k: number, ground: number): void {
    if (b.mode === MODE.off) return;
    const walk = this.walk ?? this.fallbackSheet();
    const sneak = this.sneak ?? this.fallbackSheet();
    const bob = b.breath > 0 ? Math.sin((ti / 1000) * INTRO.crouch.breathHz * 6.2832) * INTRO.crouch.breathPx * b.breath : 0;
    if (b.mode === MODE.walk) {
      if (walk) this.blitSheet(ctx, walk, Math.floor((b.dist / (walk.pxPerCycle * k)) * walk.frames), b.x, ground, k, b.mirrored);
    } else if (b.mode === MODE.sneak) {
      if (sneak) this.blitSheet(ctx, sneak, Math.floor((b.dist / (sneak.pxPerCycle * k)) * sneak.frames), b.x, ground, k, b.mirrored, 1, bob);
    } else if (b.mode === MODE.look) {
      const look = this.look;
      const still = this.fallbackSheet();
      if (look) this.blitSheet(ctx, look, b.yaw * (look.frames - 1), b.x, ground, k, b.mirrored, 1, bob);
      else if (still) this.blitSheet(ctx, still, 0, b.x, ground, k, b.mirrored, 1, bob);
    } else if (b.mode === MODE.crouch) {
      const cd = this.crouch;
      const cl = this.crouchLook;
      const cp = this.crouchPeek;
      if (!cd || !cl || !cp) return;
      // all sheets share one camera, so the feet stay planted when every crouch sheet is anchored on the standing hips x (the hips themselves sway back as he crouches)
      const hx = cd.hipsList?.[0] ?? cd.hipsX;
      if (b.cphase === CROUCH.down || b.cphase === CROUCH.rise) this.blitSheet(ctx, cd, b.depth * (cd.frames - 1), b.x, ground, k, b.mirrored, 1, 0, hx);
      else if (b.cphase === CROUCH.peek) this.blitSheet(ctx, cp, b.depth * (cp.frames - 1), b.x, ground, k, b.mirrored, 1, 0, hx);
      else this.blitSheet(ctx, cl, this.headFrame(cl, b.yaw, b.pitch), b.x, ground, k, b.mirrored, 1, bob, hx);
    } else if (b.glance) {
      const look = this.look;
      if (look) this.blitSheet(ctx, look, b.yaw * (look.frames - 1), b.x, ground, k, true);
    } else if (b.turn < 0.5) {
      // planting: he is still facing left, and turns on the spot (narrowing) towards the wall
      const still = this.look ?? this.sneak ?? this.fallbackSheet();
      if (still) this.blitSheet(ctx, still, 0, b.x, ground, k, true, 1 - 1.6 * b.turn, bob);
    } else this.drawReach(ctx, plan, sig.pen, b, ti, k, ground, walk);
  }

  /** The runner walks in, looks about, crouches and scans, tiptoes, sets himself, writes "Custom" with the nozzle exactly on the pen, and walks off. */
  private drawReturn(ctx: CanvasRenderingContext2D, ti: number, g: IntroGeom, spriteS: number): void {
    const sig = g.sig;
    const r = this.runner;
    if (!sig || !r) return;
    const plan = this.returnPlan(g);
    if (!plan || ti < INTRO.returnStartMs) return;
    const b = this.body;
    sampleReturn(plan, ti, b);
    const k = spriteS / r.w;
    const ground = sig.y + (RUN_FOOT - r.nozzleY) * k; // his feet: where the first pass's runner stood on this row
    if (ti >= plan.tSneakEnd) this.drawPenMist(ctx, plan, sig.pen, ti, spriteS);
    if (b.mode === MODE.off) return;
    // a change of pose set fades over sheetFadeMs: the outgoing pose is held at its last frame underneath, the incoming one fades in over it
    let cut = -1;
    for (let i = 0; i < plan.cuts.length; i++) {
      const c = plan.cuts[i] ?? 0;
      if (ti >= c && ti - c < INTRO.sheetFadeMs) cut = c;
    }
    ctx.save();
    ctx.shadowColor = "rgba(232,168,90,0.55)";
    ctx.shadowBlur = spriteS * 0.05;
    this.ga = 1;
    if (cut >= 0) {
      sampleReturn(plan, cut - 1, this.bodyOld);
      this.drawBody(ctx, plan, this.bodyOld, cut - 1, sig, k, ground);
      const u = (ti - cut) / INTRO.sheetFadeMs;
      this.ga = u * u * (3 - 2 * u);
    }
    this.drawBody(ctx, plan, b, ti, sig, k, ground);
    this.ga = 1;
    ctx.restore();
  }

  /** One reach pose drawn with its feet on the planted spot; only the upper body leans (a smooth shear from the knees up) so the nozzle sits exactly on the pen. `cutY`: canvas y above which the pose is drawn (the legs below come from elsewhere), or null. */
  private drawPose(ctx: CanvasRenderingContext2D, R: ReachSheet, i: number, alpha: number, bx: number, ground: number, k: number, dx: number, dy: number, cutY: number | null): void {
    const f = R.frame[i] ?? 0;
    const sx0 = (f % R.cols) * R.size;
    const sy0 = Math.floor(f / R.cols) * R.size;
    const ax = bx - (R.hx[i] ?? 0) * k;
    const ay = ground - R.footY * k;
    const L = Math.max(1, R.footY - (R.hy[i] ?? 0));
    ctx.save();
    if (R.shaded) ctx.shadowColor = "rgba(0,0,0,0)";
    ctx.globalAlpha = alpha * this.ga;
    if (cutY !== null) {
      ctx.beginPath();
      ctx.rect(bx - 4 * R.size * k, ground - 4 * R.size * k, 8 * R.size * k, cutY - (ground - 4 * R.size * k));
      ctx.clip();
    }
    if (Math.abs(dx) + Math.abs(dy) < 0.4) ctx.drawImage(R.img, sx0, sy0, R.size, R.size, ax, ay, R.size * k, R.size * k);
    else {
      const H = 8;
      ctx.shadowColor = "rgba(0,0,0,0)"; // a glow per strip would band the body
      for (let r0 = 0; r0 < R.size; r0 += H) {
        const sh = Math.min(H, R.size - r0);
        const u = (R.footY - (r0 + sh / 2) - 0.3 * L) / (0.6 * L);
        const w = u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
        ctx.drawImage(R.img, sx0, sy0 + r0, R.size, sh, ax + dx * w, ay + r0 * k + dy * w, R.size * k, sh * k + 1);
      }
    }
    ctx.restore();
  }

  /**
   * The two spray poses whose nozzles are nearest the pen, cross-faded by distance. He stands planted: the feet stay on the spot and only the arm and upper body follow the pen,
   * each pose leaning just enough that its nozzle sits exactly on it. Between standing places the legs are the walk cycle for the steps.
   */
  private drawReach(ctx: CanvasRenderingContext2D, plan: ReturnPlan, pen: SigPen, b: BodyState, ti: number, k: number, ground: number, walk: Sheet | null): void {
    const R = this.reachSheet();
    if (!R) return;
    const p = this.penNow;
    penAt(plan.write, pen, Math.max(0, b.wt), p);
    let i1 = 0;
    let i2 = -1;
    let d1 = 1e18;
    let d2 = 1e18;
    for (let i = 0; i < R.n; i++) {
      // how far this pose's nozzle would be from the pen with the body planted at b.x
      const d = Math.hypot(p.x - (b.x + ((R.nx[i] ?? 0) - (R.hx[i] ?? 0)) * k), p.y - (ground + ((R.ny[i] ?? 0) - R.footY) * k));
      if (d < d1) {
        i2 = i1 === i ? -1 : i1;
        d2 = d1;
        i1 = i;
        d1 = d;
      } else if (d < d2) {
        i2 = i;
        d2 = d;
      }
    }
    const shakeY = b.shake * INTRO.shakeAmp * this.spriteS;
    const dxOf = (i: number): number => p.x - (b.x + ((R.nx[i] ?? 0) - (R.hx[i] ?? 0)) * k);
    const dyOf = (i: number): number => p.y - (ground + ((R.ny[i] ?? 0) - R.footY) * k) + shakeY;
    // the turn to face the wall: the pose widens from a sliver, about the body so the feet stay put
    const sx = b.turn < 1 ? 0.2 + 1.6 * (b.turn - 0.5) : 1;
    ctx.save();
    ctx.translate(b.x, 0);
    ctx.scale(sx, 1);
    ctx.translate(-b.x, 0);
    let cut: number | null = null;
    if (b.stepping && walk) {
      // walking to the next place: the legs are the walk cycle (cut at the hips), the upper body stays the spray pose leaning to the pen
      cut = ground - (walk.footY - 150) * k;
      ctx.save();
      ctx.beginPath();
      ctx.rect(b.x - 4 * R.size * k, cut, 8 * R.size * k, 8 * R.size * k);
      ctx.clip();
      this.blitSheet(ctx, walk, Math.floor((b.travelled / (walk.pxPerCycle * k)) * walk.frames), b.x, ground, k, false);
      ctx.restore();
    }
    this.drawPose(ctx, R, i1, 1, b.x, ground, k, dxOf(i1), dyOf(i1), cut);
    if (i2 >= 0 && d1 + d2 > 0) {
      ctx.shadowColor = "rgba(0,0,0,0)"; // the glow belongs under the body, not over the first pose
      this.drawPose(ctx, R, i2, 2 * (d1 / (d1 + d2)) ** 2, b.x, ground, k, dxOf(i2), dyOf(i2), cut); // squared: the second pose only shows near the halfway point
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    void ti;
  }

  /** Soft puffs at where the nozzle was while it was on the wall (fading over ~0.9 s), and a few fine flecks at the nozzle now. */
  private drawPenMist(ctx: CanvasRenderingContext2D, plan: ReturnPlan, pen: SigPen, ti: number, spriteS: number): void {
    const o = this.penOld;
    const LIFE = 900;
    for (let k = 0; k < 18; k++) {
      const age = k * 50;
      const t = ti - age - plan.tWrite0;
      if (t < 0 || t > plan.write.totalMs) continue;
      penAt(plan.write, pen, t, o);
      if (!o.down) continue;
      const life = age / LIFE;
      const a = 0.26 * (1 - life) ** 1.6;
      if (a < 0.01) continue;
      const jx = (vr(k, 7) - 0.5) * spriteS * 0.04;
      const jy = (vr(k, 8) - 0.5) * spriteS * 0.05 - life * spriteS * 0.04;
      const R = spriteS * (0.014 + 0.04 * life);
      const g2 = ctx.createRadialGradient(o.x + jx, o.y + jy, 0, o.x + jx, o.y + jy, R);
      g2.addColorStop(0, `rgba(196,85,58,${a.toFixed(3)})`);
      g2.addColorStop(1, "rgba(196,85,58,0)");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(o.x + jx, o.y + jy, R, 0, 6.2832);
      ctx.fill();
    }
    const t = ti - plan.tWrite0;
    if (t < 0 || t > plan.write.totalMs) return;
    penAt(plan.write, pen, t, o);
    if (!o.down) return;
    const fr = Math.floor(ti / 33);
    ctx.fillStyle = "rgba(196,85,58,0.5)";
    for (let k = 0; k < 14; k++) {
      const ang = vr(k, fr) * 6.2832;
      const rr = spriteS * 0.035 * vr(k, fr + 41) ** 1.5;
      const s = 1 + 1.6 * vr(k, fr + 77);
      ctx.fillRect(o.x + Math.cos(ang) * rr, o.y + Math.sin(ang) * rr, s, s);
    }
  }

  /** A trail of soft puffs at the nozzle's earlier positions, growing and thinning with age. */
  private drawMist(ctx: CanvasRenderingContext2D, xAt: (t: number) => number | null, ti: number, y: number, spriteS: number, colour: () => Rgb): void {
    const [r, gg, b] = colour();
    const LIFE = 900;
    for (let k = 0; k < 18; k++) {
      const age = k * 50;
      const px = xAt(ti - age);
      if (px === null) continue;
      const life = age / LIFE;
      const a = 0.26 * (1 - life) ** 1.6;
      if (a < 0.01) continue;
      const jx = (vr(k, 7) - 0.5) * spriteS * 0.07;
      const jy = (vr(k, 8) - 0.5) * spriteS * 0.1 - life * spriteS * 0.05; // it drifts up as it thins
      const R = spriteS * (0.018 + 0.05 * life);
      const g2 = ctx.createRadialGradient(px + jx, y + jy, 0, px + jx, y + jy, R);
      g2.addColorStop(0, `rgba(${r},${gg},${b},${a.toFixed(3)})`);
      g2.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(px + jx, y + jy, R, 0, 6.2832);
      ctx.fill();
    }
  }
}
