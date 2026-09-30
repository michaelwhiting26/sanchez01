import type { PenSampler, Vec } from "./writer";

/** One stroke of the signature, sampled at even arc-length steps in the svg's own units. */
export interface StrokeTable {
  len: number;
  step: number;
  xs: Float32Array;
  ys: Float32Array;
}

/** Sample a polyline function `pointAt(l)` (an SVG path's getPointAtLength) into an even table, roughly `spacing` svg units apart. */
export function tabulate(len: number, pointAt: (l: number) => Vec, spacing = 2): StrokeTable {
  const n = Math.max(2, Math.ceil(len / spacing));
  const xs = new Float32Array(n + 1);
  const ys = new Float32Array(n + 1);
  for (let k = 0; k <= n; k++) {
    const p = pointAt((len * k) / n);
    xs[k] = p.x;
    ys[k] = p.y;
  }
  return { len, step: len / n, xs, ys };
}

/** The affine map svg user units -> client px (a DOMMatrix's a..f), taken when the tables were built. */
export interface Affine {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

/**
 * The pen of the "Custom" signature in canvas pixels. `sample(i, l)` is the point `l` svg units along stroke `i`, mapped through the
 * svg's on-screen transform (viewBox scale, the CSS rotate and translate, phone or desktop). `setOrigin` follows the signature's box
 * if the page moves under the canvas since the tables were built.
 */
export class SigPen implements PenSampler {
  readonly count: number;
  readonly lens: Float64Array;
  private ox = 0;
  private oy = 0;

  constructor(
    private readonly tables: readonly StrokeTable[],
    private readonly m: Affine,
    private readonly dpr: number,
    private readonly builtLeft: number,
    private readonly builtTop: number,
  ) {
    this.count = tables.length;
    this.lens = Float64Array.from(tables.map((t) => t.len));
  }

  /** Current client-space top-left of the signature's box. */
  setOrigin(left: number, top: number): void {
    this.ox = left - this.builtLeft;
    this.oy = top - this.builtTop;
  }

  sample(i: number, l: number, out: Vec): void {
    const t = this.tables[i];
    if (!t) {
      out.x = 0;
      out.y = 0;
      return;
    }
    const f = Math.min(Math.max(l / t.step, 0), t.xs.length - 1);
    const j = Math.min(Math.floor(f), t.xs.length - 2);
    const u = f - j;
    const x = (t.xs[j] ?? 0) + ((t.xs[j + 1] ?? 0) - (t.xs[j] ?? 0)) * u;
    const y = (t.ys[j] ?? 0) + ((t.ys[j + 1] ?? 0) - (t.ys[j] ?? 0)) * u;
    const { a, b, c, d, e, f: tf } = this.m;
    out.x = (a * x + c * y + e + this.ox) * this.dpr;
    out.y = (b * x + d * y + tf + this.oy) * this.dpr;
  }
}
