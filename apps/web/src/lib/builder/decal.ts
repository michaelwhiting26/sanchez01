import { SIZE_MAX, SIZE_MIN } from "./product";

/**
 * Where a logo or line of words may sit on a panel. Each panel has a flat picture the same shape as the leather; the mark is drawn on that
 * picture and the picture is wrapped onto the glove. Nothing is allowed to run off the edge of the picture: a mark that would is moved back
 * inside the safe area, and one too large to fit at all is made smaller.
 */
export const SAFE_MARGIN = 0.06;

export interface Placed {
  /** Centre, in picture pixels. */
  readonly x: number;
  readonly y: number;
  /** Drawn width and height in pixels, before turning. */
  readonly w: number;
  readonly h: number;
  /** The size actually used, after any shrink to fit. */
  readonly size: number;
}

/** Half-width and half-height of the upright box around a w by h mark turned by `deg`. */
export function turnedExtent(w: number, h: number, deg: number): { ex: number; ey: number } {
  const r = (deg * Math.PI) / 180;
  const c = Math.abs(Math.cos(r));
  const s = Math.abs(Math.sin(r));
  return { ex: (w * c + h * s) / 2, ey: (w * s + h * c) / 2 };
}

const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));

/**
 * Fits a mark to a W by H picture. `size` is the mark's height as a share of the picture's shorter side, `aspect` its width over height,
 * (u, v) its centre in 0 to 1.
 */
export function placeMark(W: number, H: number, mark: { u: number; v: number; size: number; turn: number; aspect: number }): Placed {
  const mx = W * SAFE_MARGIN;
  const my = H * SAFE_MARGIN;
  const short = Math.min(W, H);
  let size = clamp(mark.size, SIZE_MIN, SIZE_MAX);
  let h = size * short;
  let w = h * mark.aspect;
  let { ex, ey } = turnedExtent(w, h, mark.turn);
  const fit = Math.min((W - 2 * mx) / (2 * ex), (H - 2 * my) / (2 * ey));
  if (fit < 1) {
    size *= fit;
    h *= fit;
    w *= fit;
    ex *= fit;
    ey *= fit;
  }
  return { x: clamp(mark.u * W, mx + ex, W - mx - ex), y: clamp(mark.v * H, my + ey, H - my - ey), w, h, size };
}

/** Whether a point (picture pixels) is on the mark, with a little slack so a finger can pick it up. */
export function hitsMark(p: Placed, turn: number, x: number, y: number, slack = 1.25): boolean {
  const r = (-turn * Math.PI) / 180;
  const dx = x - p.x;
  const dy = y - p.y;
  const lx = dx * Math.cos(r) - dy * Math.sin(r);
  const ly = dx * Math.sin(r) + dy * Math.cos(r);
  return Math.abs(lx) <= (p.w / 2) * slack && Math.abs(ly) <= (p.h / 2) * slack;
}

/** Picture size in pixels for a panel that is `widthM` by `heightM` on the glove: the longer side gets `longest` pixels. */
export function pictureSize(widthM: number, heightM: number, longest = 1024): { W: number; H: number } {
  const k = longest / Math.max(widthM, heightM);
  return { W: Math.max(64, Math.round(widthM * k)), H: Math.max(64, Math.round(heightM * k)) };
}
