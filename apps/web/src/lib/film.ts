/**
 * The film tape as a 3D ribbon that barrel-rolls round the gallery. The gallery rectangle sits on a horizontal axis at 0; the tape is a helix round that
 * axis (radius about half the section height), so its front half passes over the slides and its back half behind them. Its roll is driven by the
 * gallery's pinned scroll progress. Drawn with Canvas 2D: one detailed texture strip is sliced into small quads and projected with perspective.
 * Two canvases share the section: the back half sits under the carousel, the front half over it.
 */
const TEX_H = 220;
const TEX_W = 1560; // 13 frames of 120px: the frame numbers 1..9 then 1..4, so the pattern only repeats once round

/** Build the tape texture: translucent emulsion base, grain, bevelled sprocket holes, frame windows, single-digit frame numbers and edge print. */
export function makeTapeTexture(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = TEX_W;
  c.height = TEX_H;
  const g = c.getContext("2d");
  if (!g) return c;
  // base: developed film, a deep translucent brown, lighter through the middle of the band where the light passes through
  const base = g.createLinearGradient(0, 0, 0, TEX_H);
  base.addColorStop(0, "#180b04");
  base.addColorStop(0.1, "#4a2610");
  base.addColorStop(0.5, "#5c3115");
  base.addColorStop(0.9, "#43220d");
  base.addColorStop(1, "#150a03");
  g.fillStyle = base;
  g.fillRect(0, 0, TEX_W, TEX_H);
  // a soft specular sheen sliding across the base, and the orange glow that backlit film has along both edges
  const sheen = g.createLinearGradient(0, 0, TEX_W * 0.18, TEX_H);
  sheen.addColorStop(0, "rgba(255,226,180,0)");
  sheen.addColorStop(0.45, "rgba(255,226,180,0.10)");
  sheen.addColorStop(1, "rgba(255,226,180,0)");
  g.fillStyle = sheen;
  for (let x = -TEX_W * 0.1; x < TEX_W; x += 260) {
    g.save();
    g.translate(x, 0);
    g.fillRect(0, 0, 130, TEX_H);
    g.restore();
  }
  for (const y of [0, TEX_H - 4]) {
    const edge = g.createLinearGradient(0, y, 0, y + 4);
    edge.addColorStop(y === 0 ? 0 : 1, "rgba(255,150,60,0.55)");
    edge.addColorStop(y === 0 ? 1 : 0, "rgba(255,150,60,0)");
    g.fillStyle = edge;
    g.fillRect(0, y, TEX_W, 4);
  }
  // the picture windows are translucent so the gallery reads through the film
  const FR = 120;
  const frames = TEX_W / FR;
  g.globalCompositeOperation = "destination-out";
  for (let f = 0; f < frames; f++) {
    g.fillStyle = "rgba(0,0,0,0.5)";
    g.fillRect(f * FR + 7, 44, FR - 14, TEX_H - 88);
  }
  // sprocket holes: real perforations with a lit rim
  const holeW = 19;
  const holeH = 14;
  const rr = (x: number, y: number, w: number, h: number, r: number): void => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };
  g.fillStyle = "#000";
  for (let x = 6; x < TEX_W; x += 30) for (const y of [15, TEX_H - 15 - holeH]) {
    rr(x, y, holeW, holeH, 3.2);
    g.fill();
  }
  g.globalCompositeOperation = "source-over";
  for (let x = 6; x < TEX_W; x += 30) for (const y of [15, TEX_H - 15 - holeH]) {
    rr(x, y, holeW, holeH, 3.2);
    g.strokeStyle = "rgba(255,181,112,0.5)"; // the light catching the rim
    g.lineWidth = 1.2;
    g.stroke();
    rr(x + 0.8, y + 0.8, holeW - 1.6, 4, 2);
    g.fillStyle = "rgba(20,8,0,0.35)"; // the inner shadow along the top of each hole
    g.fill();
  }
  // frame lines, single-digit frame numbers and edge print
  g.font = "600 15px 'Barlow Condensed', 'Arial Narrow', sans-serif";
  g.textBaseline = "middle";
  for (let f = 0; f < frames; f++) {
    g.fillStyle = "rgba(40,16,2,0.55)";
    g.fillRect(f * FR + FR - 3, 40, 1.6, TEX_H - 80);
    g.fillStyle = "rgba(255,190,120,0.8)";
    g.fillText(String((f % 9) + 1), f * FR + 12, 38);
    g.fillText(String((f % 9) + 1), f * FR + 12, TEX_H - 38);
    g.fillStyle = "rgba(255,190,120,0.5)";
    g.font = "500 8px 'Barlow', Arial, sans-serif";
    g.fillText("SANCHEZ 400", f * FR + 46, 33);
    g.fillText("▸ " + String((f % 9) + 1) + "A", f * FR + 46, TEX_H - 33);
    g.font = "600 15px 'Barlow Condensed', 'Arial Narrow', sans-serif";
  }
  // emulsion mottling and grain: kept faint so it reads as film, not noise
  const img = g.getImageData(0, 0, TEX_W, TEX_H);
  const d = img.data;
  let seed = 1234567;
  const rnd = (): number => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const n = (rnd() - 0.5) * 30;
    d[i] = Math.max(0, Math.min(255, (d[i] ?? 0) + n));
    d[i + 1] = Math.max(0, Math.min(255, (d[i + 1] ?? 0) + n * 0.8));
    d[i + 2] = Math.max(0, Math.min(255, (d[i + 2] ?? 0) + n * 0.6));
  }
  g.putImageData(img, 0, 0);
  return c;
}

export interface FilmOptions {
  section: HTMLElement;
  /** Scroll progress through the gallery, 0..1. */
  progress: () => number;
  reduced: boolean;
}

export class FilmHelix {
  private readonly back = document.createElement("canvas");
  private readonly front = document.createElement("canvas");
  private readonly bctx: CanvasRenderingContext2D | null;
  private readonly fctx: CanvasRenderingContext2D | null;
  private readonly tex = makeTapeTexture();
  private raf = 0;
  private live = false;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private readonly io: IntersectionObserver;
  private readonly ro: ResizeObserver;

  constructor(private readonly o: FilmOptions) {
    for (const [cv, z] of [[this.back, -1], [this.front, 6]] as const) {
      cv.setAttribute("aria-hidden", "true");
      cv.style.cssText = `position:absolute;inset:0;inline-size:100%;block-size:100%;pointer-events:none;z-index:${z}`;
    }
    this.back.className = "film film--back";
    this.front.className = "film film--front";
    this.bctx = this.back.getContext("2d");
    this.fctx = this.front.getContext("2d");
    o.section.prepend(this.back);
    o.section.append(this.front);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(o.section);
    this.io = new IntersectionObserver((e) => {
      this.live = e[0]?.isIntersecting ?? false;
      if (this.live && !this.raf && !this.o.reduced) this.raf = requestAnimationFrame(this.loop);
      if (this.o.reduced) this.draw();
    });
    this.io.observe(o.section);
    this.resize();
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    this.ro.disconnect();
    this.back.remove();
    this.front.remove();
  }

  private resize(): void {
    const r = this.o.section.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, Math.round(r.width * this.dpr));
    this.h = Math.max(1, Math.round(r.height * this.dpr));
    for (const cv of [this.back, this.front]) {
      cv.width = this.w;
      cv.height = this.h;
    }
    this.draw();
  }

  private readonly loop = (): void => {
    this.raf = 0;
    if (!this.live) return;
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  draw(): void {
    const { bctx, fctx, w, h } = this;
    if (!bctx || !fctx) return;
    bctx.clearRect(0, 0, w, h);
    fctx.clearRect(0, 0, w, h);
    const p = this.o.progress();
    const R = h * 0.47; // the tape passes just inside the top and bottom of the section
    const bandW = h * 0.135;
    const f = R * 3.4; // camera distance
    const TURNS = 2.4;
    const N = 220;
    const dphi = (TURNS * 2 * Math.PI) / N;
    const spanX = w * 0.86;
    const roll = p * Math.PI * 2 * 1.5; // the barrel roll: the whole ribbon rotates about the axis as the gallery scrolls
    const cx = w / 2;
    const cy = h / 2;
    const proj = (phi: number, x: number): { x: number; y: number; z: number } => {
      const y = R * Math.cos(phi);
      const z = R * Math.sin(phi);
      const s = f / (f - z);
      return { x: cx + x * s, y: cy + y * s, z };
    };
    interface Seg {
      z: number;
      j: number;
    }
    const segs: Seg[] = [];
    for (let j = 0; j < N; j++) {
      const phi = j * dphi + roll;
      segs.push({ z: R * Math.sin(phi + dphi / 2), j });
    }
    segs.sort((a, b) => a.z - b.z);
    const arc = R * dphi; // world length of one slice
    const sw = arc * (TEX_H / bandW); // texture pixels per slice, so the numbers keep their proportions
    for (const { z, j } of segs) {
      const phi0 = j * dphi + roll;
      const phi1 = phi0 + dphi;
      const xa = (j / N - 0.5) * spanX;
      const xb = ((j + 1) / N - 0.5) * spanX;
      const a = proj(phi0, xa - bandW / 2);
      const b = proj(phi1, xb - bandW / 2);
      const c = proj(phi0, xa + bandW / 2);
      const ctx = z < 0 ? bctx : fctx;
      const u0 = (j * sw) % TEX_W;
      const draw = (sx: number, sWidth: number, off: number): void => {
        const k = sWidth / sw;
        ctx.setTransform(((b.x - a.x) * k) / sWidth, ((b.y - a.y) * k) / sWidth, (c.x - a.x) / TEX_H, (c.y - a.y) / TEX_H, a.x + (b.x - a.x) * off, a.y + (b.y - a.y) * off);
        ctx.drawImage(this.tex, sx, 0, sWidth, TEX_H, 0, 0, sWidth + 0.8, TEX_H);
      };
      if (u0 + sw <= TEX_W) draw(u0, sw, 0);
      else {
        const first = TEX_W - u0;
        draw(u0, first, 0);
        draw(0, sw - first, first / sw);
      }
      // depth: the far side of the loop sits in shadow, the near side catches the light
      const depth = (z + R) / (2 * R);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      const d2 = proj(phi1, xb + bandW / 2);
      ctx.lineTo(d2.x, d2.y);
      ctx.lineTo(c.x, c.y);
      ctx.closePath();
      ctx.fillStyle = `rgba(6,3,1,${(0.62 * (1 - depth)).toFixed(3)})`;
      ctx.fill();
    }
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
