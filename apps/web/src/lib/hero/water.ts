import type { Rgb } from "./config";

/** Water-paint overlay: bubbles that rise in the wet letters, and runoff bubbles that leave the letter corners and flow out into the tan waves. It only draws extra coloured elements on top; the tan waves are never touched. */
export const WATER = {
  /** Interior bubbles born per second while the paint is wet, and the cap on all live particles. */
  bubbleRate: 15,
  runoffRate: 5,
  maxParticles: 90,
  bubbleLife: [0.9, 1.7] as const,
  bubbleRadius: [2.2, 5.0] as const,
  runoffLife: [1.6, 2.8] as const,
  runoffSpeed: [5, 13] as const,
  /** Faint colour left in the waves behind a runoff bubble (alpha never above this). */
  leakAlpha: 0.22,
} as const;

interface Particle {
  kind: 0 | 1; // 0 bubble in the letters, 1 runoff bubble
  x: number;
  m: number;
  vx: number;
  vy: number;
  r: number;
  age: number;
  life: number;
  colour: Rgb;
  trail: Array<{ x: number; m: number }>;
}

export interface WaterField {
  mw: number;
  mh: number;
  letters: Uint8Array;
  outline: Uint8Array;
  dist: Float32Array;
  /** Flag colour at normalised (u, v). */
  colourAt(u: number, v: number): Rgb;
  sx0: number;
  span: number;
  slope: number;
}

/** Outline cells on convex corners and ends: few letter or outline cells in their neighbourhood. Pure. */
export function findCorners(letters: Uint8Array, outline: Uint8Array, mw: number, mh: number): Array<[number, number]> {
  const R = 5;
  const total = (2 * R + 1) ** 2;
  const out: Array<[number, number]> = [];
  for (let y = R; y < mh - R; y += 2) {
    for (let x = R; x < mw - R; x += 2) {
      if (!outline[y * mw + x]) continue;
      let n = 0;
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) if (letters[(y + dy) * mw + x + dx] || outline[(y + dy) * mw + x + dx]) n++;
      if (n < total * 0.52) out.push([x, y]); // a straight edge fills about half the window: less than that is a convex corner or an end
    }
  }
  return out;
}

const rand = (a: number, b: number): number => a + Math.random() * (b - a);

export class WaterPaint {
  private readonly parts: Particle[] = [];
  private readonly corners: Array<[number, number]>;
  private readonly cells: Array<[number, number]> = [];
  private carry = { b: 0, r: 0 };

  constructor(private readonly f: WaterField) {
    this.corners = findCorners(f.letters, f.outline, f.mw, f.mh);
    for (let y = 0; y < f.mh; y += 3) for (let x = 0; x < f.mw; x += 3) if (f.letters[y * f.mw + x]) this.cells.push([x, y]);
  }

  get count(): number {
    return this.parts.length;
  }

  /** Outward (away from the word) unit vector at a cell, from the distance map. */
  private outward(x: number, m: number): [number, number] {
    const { mw, mh, dist } = this.f;
    const at = (xx: number, yy: number): number => dist[Math.min(mh - 1, Math.max(0, yy)) * mw + Math.min(mw - 1, Math.max(0, xx))] ?? 0;
    const gx = at(Math.round(x) + 2, Math.round(m)) - at(Math.round(x) - 2, Math.round(m));
    const gy = at(Math.round(x), Math.round(m) + 2) - at(Math.round(x), Math.round(m) - 2);
    const l = Math.hypot(gx, gy);
    if (l < 1e-3) {
      const a = Math.random() * 6.2832;
      return [Math.cos(a), Math.sin(a)];
    }
    return [gx / l, gy / l];
  }

  /** `front` is the spray front (cells of x + slope*row already painted). Nothing is born ahead of the front, so bubbles only appear in wet paint. */
  advance(dtMs: number, front: number): void {
    const dt = Math.min(0.05, Math.max(0, dtMs / 1000));
    if (dt <= 0) return;
    const { f, parts } = this;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (!p) continue;
      p.age += dt;
      if (p.age >= p.life) {
        parts.splice(i, 1);
        continue;
      }
      if (p.kind === 1) {
        p.trail.push({ x: p.x, m: p.m });
        if (p.trail.length > 14) p.trail.shift();
        p.x += p.vx * dt;
        p.m += p.vy * dt;
      } else {
        p.x += p.vx * dt;
        p.m += p.vy * dt;
      }
    }
    this.carry.b += WATER.bubbleRate * dt;
    this.carry.r += WATER.runoffRate * dt;
    while (this.carry.b >= 1 && parts.length < WATER.maxParticles) {
      this.carry.b -= 1;
      const c = this.cells[(Math.random() * this.cells.length) | 0];
      if (!c || c[0] - f.sx0 + f.slope * c[1] > front) continue;
      parts.push({ kind: 0, x: c[0], m: c[1], vx: rand(-0.4, 0.4), vy: rand(-0.6, 0.1), r: rand(...WATER.bubbleRadius), age: 0, life: rand(...WATER.bubbleLife), colour: f.colourAt((c[0] - f.sx0) / f.span, c[1] / f.mh), trail: [] });
    }
    while (this.carry.r >= 1 && parts.length < WATER.maxParticles) {
      this.carry.r -= 1;
      const c = this.corners[(Math.random() * this.corners.length) | 0];
      if (!c || c[0] - f.sx0 + f.slope * c[1] > front) continue;
      const [ox, oy] = this.outward(c[0], c[1]);
      const sp = rand(...WATER.runoffSpeed);
      parts.push({ kind: 1, x: c[0], m: c[1], vx: ox * sp, vy: oy * sp, r: rand(2, 4), age: 0, life: rand(...WATER.runoffLife), colour: f.colourAt((c[0] - f.sx0) / f.span, c[1] / f.mh), trail: [] });
    }
    this.carry.b = Math.min(this.carry.b, 2);
    this.carry.r = Math.min(this.carry.r, 2);
  }

  draw(ctx: CanvasRenderingContext2D, cell: number, ox: number, r0: number, sy0: number): void {
    const rgba = (c: Rgb, a: number): string => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
    for (const p of this.parts) {
      const u = p.age / p.life;
      const px = ox + (p.x + 0.5) * cell;
      const py = (r0 + p.m) * cell - sy0;
      if (p.kind === 0) {
        // a bubble of wet paint: grows to a dome, shines, then bursts
        const grow = Math.min(1, u * 3.2);
        const R = p.r * cell * (0.35 + 0.65 * grow) * (1 + (u > 0.85 ? (u - 0.85) * 3 : 0));
        const a = u > 0.85 ? Math.max(0, 1 - (u - 0.85) / 0.15) : 1;
        const g = ctx.createRadialGradient(px - R * 0.32, py - R * 0.38, R * 0.05, px, py, R);
        g.addColorStop(0, `rgba(255,255,255,${(0.85 * a).toFixed(3)})`);
        g.addColorStop(0.2, rgba([Math.min(255, p.colour[0] + 70), Math.min(255, p.colour[1] + 70), Math.min(255, p.colour[2] + 70)], 0.6 * a));
        g.addColorStop(0.72, rgba(p.colour, 0.42 * a));
        g.addColorStop(1, rgba([p.colour[0] * 0.35, p.colour[1] * 0.35, p.colour[2] * 0.35], 0.75 * a));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, R, 0, 6.2832);
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${(0.35 * a).toFixed(3)})`;
        ctx.lineWidth = Math.max(1, cell * 0.12);
        ctx.stroke();
      } else {
        // a runoff bubble leaving the corner, leaving a faint trail of colour in the waves
        const fade = 1 - u * u;
        p.trail.forEach((t, k) => {
          const ta = (k / p.trail.length) * WATER.leakAlpha * fade;
          ctx.fillStyle = rgba(p.colour, ta);
          const s = cell * 0.55 * (0.4 + k / p.trail.length);
          ctx.fillRect(ox + (t.x + 0.5) * cell - s / 2, (r0 + t.m) * cell - sy0 - s / 2, s, s);
        });
        const R = p.r * cell * (1 - 0.5 * u);
        const g = ctx.createRadialGradient(px - R * 0.3, py - R * 0.35, R * 0.05, px, py, R);
        g.addColorStop(0, `rgba(255,255,255,${(0.8 * fade).toFixed(3)})`);
        g.addColorStop(0.6, rgba(p.colour, 0.7 * fade));
        g.addColorStop(1, rgba([p.colour[0] * 0.4, p.colour[1] * 0.4, p.colour[2] * 0.4], 0.7 * fade));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, R, 0, 6.2832);
        ctx.fill();
      }
    }
  }
}
