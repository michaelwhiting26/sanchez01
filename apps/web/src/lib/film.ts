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
  /** The tornado starts at the bottom of this element (the hero) and ends at the bottom of `end` (the gallery track). */
  start: HTMLElement;
  end: HTMLElement;
  reduced: boolean;
}

/**
 * Free-flowing film: three ribbons of tape that each take their own route down the page in orbit, from the bottom of the hero to the end of the
 * gallery. They are not wrapped round any axis: each is a smooth 3D curve that wanders sideways (running off the page and coming back), swings
 * in and out of the screen, and twists as it goes. The far side of every pass is full film behind the page; the near side is only a 5% outline, so
 * nothing ever stands in front of the gallery. Two fixed viewport canvases show the part of the paths that is on screen.
 */
interface Strand {
  /** Cycles per viewport height of the sideways, depth and vertical wander, and their phases. */
  fx: number;
  fx2: number;
  fz: number;
  fy: number;
  px: number;
  px2: number;
  pz: number;
  py: number;
  twist: number;
}

const STRANDS: readonly Strand[] = [
  { fx: 0.55, fx2: 1.31, fz: 0.7, fy: 0.9, px: 0, px2: 1.2, pz: 0.4, py: 0.2, twist: 0.8 },
  { fx: 0.62, fx2: 1.18, fz: 0.58, fy: 1.05, px: 2.3, px2: 3.9, pz: 2.4, py: 2.1, twist: -0.6 },
  { fx: 0.48, fx2: 1.47, fz: 0.83, fy: 0.76, px: 4.4, px2: 0.5, pz: 4.5, py: 4.0, twist: 0.5 },
];

export class FilmHelix {
  private readonly back = document.createElement("canvas");
  private readonly front = document.createElement("canvas");
  private readonly bctx: CanvasRenderingContext2D | null;
  private readonly fctx: CanvasRenderingContext2D | null;
  private readonly tex = makeTapeTexture();
  private raf = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private active = false;
  private last = 0;
  private readonly onScroll = (): void => this.kick();
  private readonly ro: ResizeObserver;

  constructor(private readonly o: FilmOptions) {
    const css = (z: number): string => `position:fixed;inset:0;inline-size:100%;block-size:100%;pointer-events:none;z-index:${z}`;
    this.back.className = "film film--back";
    this.front.className = "film film--front";
    this.back.style.cssText = css(-1);
    this.front.style.cssText = css(6);
    for (const cv of [this.back, this.front]) cv.setAttribute("aria-hidden", "true");
    this.bctx = this.back.getContext("2d");
    this.fctx = this.front.getContext("2d");
    document.body.append(this.back, this.front);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onScroll);
    this.ro = new ResizeObserver(this.onScroll);
    this.ro.observe(document.body);
    this.resize();
    this.kick();
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onScroll);
    this.ro.disconnect();
    this.back.remove();
    this.front.remove();
  }

  private kick(): void {
    if (this.raf) return;
    this.raf = requestAnimationFrame((t) => {
      this.raf = 0;
      this.draw(t);
      if (this.active && !this.o.reduced) this.kick(); // while it is on screen the ribbons keep drifting in their orbit
    });
  }

  private resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(window.innerWidth * this.dpr);
    const h = Math.round(window.innerHeight * this.dpr);
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    for (const cv of [this.back, this.front]) {
      cv.width = w;
      cv.height = h;
    }
  }

  draw(now = performance.now()): void {
    const { bctx, fctx } = this;
    if (!bctx || !fctx) return;
    this.resize();
    const { w, h, dpr } = this;
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.clearRect(0, 0, w, h);
    fctx.clearRect(0, 0, w, h);
    const scrollY = window.scrollY;
    const yStart = this.o.start.getBoundingClientRect().bottom + scrollY;
    const yEnd = this.o.end.getBoundingClientRect().bottom + scrollY;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    this.active = scrollY + vh > yStart && scrollY < yEnd;
    if (!this.active || this.o.reduced) return;
    if (now - this.last < 28) return; // ~35fps is plenty for a slow drift
    this.last = now;

    const L = yEnd - yStart;
    const drift = now * 0.00007; // the slow free drift of every path
    const f = vw * 1.6;
    const bandH = vh * 0.12;
    const ds = 16;
    const TAU = Math.PI * 2;
    const sMin = Math.max(0, scrollY - vh * 1.0 - yStart);
    const sMax = Math.min(L, scrollY + vh * 2.0 - yStart);
    const cx = vw / 2;
    type V = { x: number; y: number; z: number };
    for (const st of STRANDS) {
      const at = (sPx: number): V => {
        const c = sPx / vh;
        return {
          x: 0.5 * vw * Math.sin(TAU * st.fx * c + st.px + drift) + 0.28 * vw * Math.sin(TAU * st.fx2 * c + st.px2 - drift * 1.3),
          y: yStart + sPx + 0.3 * vh * Math.sin(TAU * st.fy * c + st.py + drift * 0.8),
          z: 0.45 * vw * Math.sin(TAU * st.fz * c + st.pz + drift * 1.1),
        };
      };
      // walk the whole path from its start so the texture never crawls as the visible window moves
      const pts: Array<{ v: V; w: V; u: number; s: number }> = [];
      let uAcc = 0;
      let prev: V | null = null;
      for (let sPx = 0; sPx <= L; sPx += ds) {
        const p = at(sPx);
        const pn = at(sPx + 2);
        const T = { x: pn.x - p.x, y: pn.y - p.y, z: pn.z - p.z };
        const tl = Math.hypot(T.x, T.y, T.z) || 1;
        T.x /= tl;
        T.y /= tl;
        T.z /= tl;
        const th = TAU * st.twist * 0.45 * (sPx / vh);
        let a = { x: Math.cos(th), y: Math.sin(th) * 0.5, z: Math.sin(th) * 0.35 }; // mostly face-on, easing edge-on as it twists
        const dot = a.x * T.x + a.y * T.y + a.z * T.z;
        a = { x: a.x - T.x * dot, y: a.y - T.y * dot, z: a.z - T.z * dot };
        const al = Math.hypot(a.x, a.y, a.z) || 1;
        if (prev) uAcc += Math.hypot(p.x - prev.x, p.y - prev.y, p.z - prev.z) * (TEX_H / bandH);
        pts.push({ v: p, w: { x: a.x / al, y: a.y / al, z: a.z / al }, u: uAcc, s: sPx });
        prev = p;
      }
      const proj = (v: V, wv: V, side: number): { x: number; y: number; z: number } => {
        const x = v.x + (wv.x * bandH * side) / 2;
        const y = v.y + (wv.y * bandH * side) / 2;
        const z = v.z + (wv.z * bandH * side) / 2;
        const sc = f / (f - z);
        return { x: (cx + x * sc) * dpr, y: ((y - scrollY - vh / 2) * sc + vh / 2) * dpr, z };
      };
      const fade = (sPx: number): number => Math.min(1, Math.min(sPx / (vh * 0.4), (L - sPx) / (vh * 0.4)));
      for (let j = Math.floor(sMin / ds); j < Math.min(pts.length - 1, Math.ceil(sMax / ds)); j++) {
        const A = pts[j];
        const B = pts[j + 1];
        if (!A || !B) continue;
        const fd = fade(A.s);
        if (fd <= 0.01) continue;
        const a0 = proj(A.v, A.w, -1);
        const b0 = proj(B.v, B.w, -1);
        const c0 = proj(A.v, A.w, 1);
        const d0 = proj(B.v, B.w, 1);
        const zMid = (A.v.z + B.v.z) / 2;
        const isBack = zMid < 0;
        const ctx = isBack ? bctx : fctx;
        const sw = Math.max(1, B.u - A.u);
        const u0 = A.u % TEX_W;
        ctx.globalAlpha = (isBack ? 0.95 : 0.05) * fd;
        const paint = (sx: number, sWidth: number, off: number): void => {
          const k = sWidth / sw;
          ctx.setTransform(((b0.x - a0.x) * k) / sWidth, ((b0.y - a0.y) * k) / sWidth, (c0.x - a0.x) / TEX_H, (c0.y - a0.y) / TEX_H, a0.x + (b0.x - a0.x) * off, a0.y + (b0.y - a0.y) * off);
          ctx.drawImage(this.tex, sx, 0, sWidth, TEX_H, 0, 0, sWidth + 0.8, TEX_H);
        };
        if (u0 + sw <= TEX_W) paint(u0, sw, 0);
        else {
          const first = TEX_W - u0;
          paint(u0, first, 0);
          paint(0, sw - first, first / sw);
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (isBack) {
          const depth = Math.min(1, Math.max(0, (zMid + vw * 0.45) / (vw * 0.9)));
          ctx.globalAlpha = fd;
          ctx.beginPath();
          ctx.moveTo(a0.x, a0.y);
          ctx.lineTo(b0.x, b0.y);
          ctx.lineTo(d0.x, d0.y);
          ctx.lineTo(c0.x, c0.y);
          ctx.closePath();
          ctx.fillStyle = `rgba(6,3,1,${(0.32 * (1 - depth)).toFixed(3)})`;
          ctx.fill();
        } else {
          ctx.globalAlpha = 0.3 * fd; // the near side is only a thin outline
          ctx.strokeStyle = "rgba(255,181,112,1)";
          ctx.lineWidth = Math.max(1, dpr * 0.8);
          ctx.beginPath();
          ctx.moveTo(a0.x, a0.y);
          ctx.lineTo(b0.x, b0.y);
          ctx.moveTo(c0.x, c0.y);
          ctx.lineTo(d0.x, d0.y);
          ctx.stroke();
        }
      }
    }
    bctx.globalAlpha = 1;
    fctx.globalAlpha = 1;
  }
}
