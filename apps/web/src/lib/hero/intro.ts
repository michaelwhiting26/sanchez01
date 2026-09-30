import { INTRO, SPRAY, type Rgb } from "./config";

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
  /** Where the pen of the signature is, as its ink is laid down: canvas x for ink progress 0..1 (never goes backwards), or null. */
  pen: ((s: number) => number) | null;
  /** The "Custom" signature's box in canvas pixels, or null. */
  sig: { left: number; right: number; y: number } | null;
}

interface Atlas {
  img: HTMLImageElement;
  frames: number;
  cols: number;
  w: number;
  h: number;
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

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** The bag silhouettes and the two runners, drawn on top of the field. All motion is a pure function of time, so a frozen time gives a frozen frame. */
export class IntroSprites {
  private runner: (Atlas & { nozzleX: number; nozzleY: number; nozzles: Array<{ x: number; y: number }> }) | null = null;
  private bag: Atlas | null = null;
  private letters: LetterBox[] = [];

  async load(letters: LetterBox[]): Promise<boolean> {
    this.letters = letters;
    const [rImg, bImg, rMeta, bMeta] = await Promise.all([
      loadImage(INTRO.assets.runner),
      loadImage(INTRO.assets.bag),
      fetch(INTRO.assets.runnerMeta).then((r) => r.json() as Promise<RunnerMeta>).catch(() => null),
      fetch(INTRO.assets.bagMeta).then((r) => r.json() as Promise<{ frames: number; w: number; h: number; cols: number }>).catch(() => null),
    ]);
    if (!rImg || !bImg || !rMeta || !bMeta) return false;
    const n = rMeta.nozzle.length || 1;
    // the can bobs with the arm; the body should not, so the sprite is anchored on the mean nozzle position
    const nozzleX = rMeta.nozzle.reduce((a, p) => a + p.x, 0) / n;
    const nozzleY = rMeta.nozzle.reduce((a, p) => a + p.y, 0) / n;
    this.runner = { img: rImg, frames: rMeta.frames, cols: rMeta.cols, w: rMeta.size, h: rMeta.size, nozzleX, nozzleY, nozzles: rMeta.nozzle };
    this.bag = { img: bImg, frames: bMeta.frames, cols: bMeta.cols, w: bMeta.w, h: bMeta.h };
    return true;
  }

  /** Letter centres in grid units and the time each bag lands, for the field's landing ripples. */
  landings(): Array<{ cx: number; cy: number; at: number }> {
    return this.letters.map((l, i) => ({ cx: l.cx, cy: (l.top + l.bottom) / 2, at: INTRO.bagsStartMs + i * INTRO.bagStaggerMs + (vr(i, 5) - 0.5) * 70 + INTRO.bagDurMs * 0.86 }));
  }

  /** How much of the "Custom" ink has been laid down, 0..1: it is drawn stroke by stroke as he sprays, at the pace of the pen. */
  inkProgress(ti: number): number {
    return clamp01((ti - INTRO.returnArriveMs) / INTRO.customPassMs);
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

  /** The returning runner's nozzle x. He laps back in from the left edge and runs left to right across "Custom", so it is written in reading order. */
  private returnRunnerX(ti: number, g: IntroGeom, spriteS: number): number {
    const sig = g.sig;
    if (!sig) return -1e9;
    // his pace is the pen's: where the ink doubles back (the loop of the C: up, back on itself, down) he slows to spend the time, and where the
    // letters are simple he moves on. A tenth of a steady drift keeps his feet from ever stopping dead.
    const left = g.pen ? g.pen(0) : sig.left;
    const right = g.pen ? g.pen(1) : sig.right;
    const width = Math.max(1, right - left);
    const vS = width / (INTRO.customPassMs / 1000);
    const enter = (INTRO.returnArriveMs - INTRO.returnStartMs) / 1000;
    const tau = (ti - INTRO.returnArriveMs) / 1000;
    const pass = INTRO.customPassMs / 1000;
    const exit = INTRO.returnExitMs / 1000;
    if (tau < 0) {
      const D = left + spriteS * 1.2; // from off the left edge, easing down to the spraying speed
      const k = (D - vS * enter) / (enter * enter);
      return left - (vS * -tau + k * tau * tau);
    }
    if (tau <= pass) {
      const p = tau / pass;
      const steady = left + width * p;
      return g.pen ? g.pen(p) * 0.9 + steady * 0.1 : steady;
    }
    const u = tau - pass;
    const D = g.cw - right + spriteS * 1.2; // then away off the right edge
    const a = Math.max(0, (2 * (D - vS * exit)) / (exit * exit));
    return right + vS * u + 0.5 * a * u * u;
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
    ctx.shadowColor = "rgba(232,168,90,0.55)"; // a soft amber edge light so the black body separates from the dark ground
    ctx.shadowBlur = spriteS * 0.05;
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
    if (g.sig && ti >= INTRO.returnStartMs && ti <= INTRO.returnArriveMs + INTRO.customPassMs + INTRO.returnExitMs + 100 + 900) {
      const sig = g.sig;
      this.drawMist(ctx, (t) => (t < INTRO.returnArriveMs - 120 ? null : this.returnRunnerX(t, g, spriteS)), ti, sig.y, spriteS, () => [196, 85, 58]);
      if (ti <= INTRO.returnArriveMs + INTRO.customPassMs + INTRO.returnExitMs + 100) {
        const tau = ti - INTRO.returnArriveMs;
        this.drawRunnerAt(ctx, this.returnRunnerX(ti, g, spriteS), sig.y, spriteS, false, bump(tau, -300, 160));
      }
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
