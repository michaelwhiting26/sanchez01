import { INTRO, SPRAY } from "./config";

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
  mw: number;
  mh: number;
  sx0: number;
  sx1: number;
  slope: number;
  psmax: number;
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
  private runner: (Atlas & { nozzleX: number; nozzleY: number }) | null = null;
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
    this.runner = { img: rImg, frames: rMeta.frames, cols: rMeta.cols, w: rMeta.size, h: rMeta.size, nozzleX, nozzleY };
    this.bag = { img: bImg, frames: bMeta.frames, cols: bMeta.cols, w: bMeta.w, h: bMeta.h };
    return true;
  }

  /** How much of "Custom" is still hidden from the right, 0..1 (1 hidden, 0 fully shown): it is sprayed in left to right behind the runner. */
  signatureHidden(ti: number, g: IntroGeom): number {
    if (!g.sig) return 0;
    if (ti < INTRO.returnArriveMs) return 1;
    if (ti > INTRO.returnArriveMs + INTRO.customPassMs) return 0;
    const x = this.returnRunnerX(ti, g, 1);
    return 1 - clamp01((x - g.sig.left) / Math.max(1, g.sig.right - g.sig.left));
  }

  draw(ctx: CanvasRenderingContext2D, ti: number, g: IntroGeom): void {
    this.drawBags(ctx, ti, g);
    this.drawRunners(ctx, ti, g);
  }

  private letterHeightPx(g: IntroGeom): number {
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
      const p = clamp01((ti - INTRO.bagsStartMs - i * INTRO.bagStaggerMs) / INTRO.bagDurMs);
      if (p <= 0) return;
      const e = 1 - (1 - p) ** 3;
      const cx = g.ox + (l.cx + 0.5) * g.cell;
      const cy = g.r0 * g.cell - g.sy0 + ((l.top + l.bottom) / 2) * g.cell;
      const y = -bagH + (cy + bagH) * e;
      const turns = 3 * (1 - p) ** 1.6; // spins fast, then eases to the side-on frame as it lands
      const frame = Math.floor(turns * bag.frames) % bag.frames;
      ctx.globalAlpha = fade * Math.min(1, p * 4);
      ctx.drawImage(bag.img, (frame % bag.cols) * bag.w, Math.floor(frame / bag.cols) * bag.h, bag.w, bag.h, cx - bagW / 2, y - bagH / 2, bagW, bagH);
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
    const width = Math.max(1, sig.right - sig.left);
    const vS = width / (INTRO.customPassMs / 1000);
    const enter = (INTRO.returnArriveMs - INTRO.returnStartMs) / 1000;
    const tau = (ti - INTRO.returnArriveMs) / 1000;
    const pass = INTRO.customPassMs / 1000;
    const exit = INTRO.returnExitMs / 1000;
    if (tau < 0) {
      const D = sig.left + spriteS * 1.2; // from off the left edge, easing down to the spraying speed
      const k = (D - vS * enter) / (enter * enter);
      return sig.left - (vS * -tau + k * tau * tau);
    }
    if (tau <= pass) return sig.left + vS * tau;
    const u = tau - pass;
    const D = g.cw - sig.right + spriteS * 1.2; // then away off the right edge
    const a = Math.max(0, (2 * (D - vS * exit)) / (exit * exit));
    return sig.right + vS * u + 0.5 * a * u * u;
  }

  private drawRunnerAt(ctx: CanvasRenderingContext2D, x: number, y: number, spriteS: number, mirrored: boolean): void {
    const r = this.runner;
    if (!r) return;
    const cycle = spriteS * 0.95;
    const raw = Math.floor(((mirrored ? -x : x) / cycle) * r.frames);
    const frame = ((raw % r.frames) + r.frames) % r.frames;
    const k = spriteS / r.w;
    ctx.save();
    ctx.translate(x, y);
    if (mirrored) ctx.scale(-1, 1);
    ctx.drawImage(r.img, (frame % r.cols) * r.w, Math.floor(frame / r.cols) * r.h, r.w, r.h, -r.nozzleX * k, -r.nozzleY * k, spriteS, spriteS);
    ctx.restore();
  }

  private drawRunners(ctx: CanvasRenderingContext2D, ti: number, g: IntroGeom): void {
    if (!this.runner) return;
    const Lh = this.letterHeightPx(g);
    const spriteS = Lh * INTRO.runnerScale;
    const top = Math.min(...this.letters.map((l) => l.top));
    const rowsPx = (row: number): number => g.r0 * g.cell - g.sy0 + row * g.cell;
    const rowAt = (share: number): number => top + share * (Lh / g.cell);
    const row = rowAt(INTRO.row);
    const x = this.frontRunnerX(ti, g, row, spriteS);
    if (x !== null) this.drawRunnerAt(ctx, x, rowsPx(row), spriteS, false);
    if (g.sig && ti >= INTRO.returnStartMs && ti <= INTRO.returnArriveMs + INTRO.customPassMs + INTRO.returnExitMs + 100) {
      this.drawRunnerAt(ctx, this.returnRunnerX(ti, g, spriteS), g.sig.y, spriteS, false);
    }
  }
}
