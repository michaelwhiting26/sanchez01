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
  /** The gallery's tall track: the film and the spotlight show only while it fills the screen. */
  track: HTMLElement;
  reduced: boolean;
}

/**
 * The film on display: two real strips of film sweep in from the empty corners of the gallery (bottom-left, top-right), curling and slowly turning as they
 * run along their path with the scroll, and a spotlight blocks out the background round the gallery's pill so the gallery is the only thing lit.
 * No outlines or lines: only the film itself. Everything sits below the gallery and above the hero field.
 */
export class FilmHelix {
  private readonly canvas = document.createElement("canvas");
  private readonly spot = document.createElement("div");
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly tex = makeTapeTexture();
  private raf = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private visible = false;
  private readonly onScroll = (): void => this.kick();
  private readonly ro: ResizeObserver;

  constructor(private readonly o: FilmOptions) {
    this.canvas.className = "film";
    this.canvas.style.cssText = "position:fixed;inset:0;inline-size:100%;block-size:100%;pointer-events:none;z-index:1";
    this.canvas.setAttribute("aria-hidden", "true");
    this.spot.className = "gallery-spot";
    this.spot.setAttribute("aria-hidden", "true");
    this.ctx = this.canvas.getContext("2d");
    document.body.append(this.spot, this.canvas);
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
    this.canvas.remove();
    this.spot.remove();
  }

  private kick(): void {
    if (this.raf) return;
    this.raf = requestAnimationFrame((t) => {
      this.raf = 0;
      this.draw(t);
      if (this.visible && !this.o.reduced) this.kick(); // the film keeps drifting while the gallery is on screen
    });
  }

  private resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(window.innerWidth * this.dpr);
    const h = Math.round(window.innerHeight * this.dpr);
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  draw(now = performance.now()): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.resize();
    const { w, h, dpr } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // how much of the screen the gallery's track fills decides how strongly the spotlight and film show
    const r = this.o.track.getBoundingClientRect();
    const vh = window.innerHeight;
    const overlap = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh;
    const k = Math.min(1, Math.max(0, (overlap - 0.1) / 0.3)); // fades in as soon as the gallery starts to enter, so the film carries on down into the space below instead of stopping at a hard edge
    this.visible = k > 0.01;
    this.spot.style.opacity = k.toFixed(3);
    if (!this.visible) return;
    const t = this.o.reduced ? 0 : now / 1000;
    const scroll = window.scrollY;
    const W = w;
    const H = h;
    const unit = Math.min(W, H);
    // the pill (the egg) is a tilted ellipse; two strips cradle it. One flows straight down from the top-right corner, hugging its right side and sweeping
    // under it; the other rises from the bottom-left corner up its left side. Their radius grows toward the ends so they cover the empty corners.
    const PHI = (-24 * Math.PI) / 180;
    const cxE = W / 2;
    const cyE = H / 2;
    const aE = W * 0.47;
    const bE = H * 0.36;
    const strips = [
      { th0: -82, th1: 112, rad: (u: number) => 1.1 + 0.62 * (1 - u) ** 2, hw: unit * 0.075, ph: 0, dir: 1 },
      { th0: 98, th1: 292, rad: (u: number) => 1.1 + 0.62 * u * u, hw: unit * 0.075, ph: 2.1, dir: -1 },
    ];
    ctx.globalAlpha = k * 0.96;
    for (const st of strips) {
      const at = (u: number): { x: number; y: number; tx: number; ty: number } => {
        const th = ((st.th0 + (st.th1 - st.th0) * u) * Math.PI) / 180;
        const wob = 1 + 0.012 * Math.sin(t * 0.4 + st.ph + u * 6); // the film breathes a little
        const r = st.rad(u) * wob;
        const dr = (st.rad(u + 0.001) - st.rad(u - 0.001)) / 0.002;
        const dth = ((st.th1 - st.th0) * Math.PI) / 180;
        const lx = aE * r * Math.cos(th);
        const ly = bE * r * Math.sin(th);
        const dx = dth * -aE * r * Math.sin(th) + dr * aE * Math.cos(th);
        const dy = dth * bE * r * Math.cos(th) + dr * bE * Math.sin(th);
        const cs = Math.cos(PHI);
        const sn = Math.sin(PHI);
        const tx = dx * cs - dy * sn;
        const ty = dx * sn + dy * cs;
        const l = Math.hypot(tx, ty) || 1;
        return { x: cxE + lx * cs - ly * sn, y: cyE + lx * sn + ly * cs, tx: tx / l, ty: ty / l };
      };
      const N = 110;
      const run = (scroll * 0.9 * dpr + t * 26 * dpr) * st.dir; // the film runs along its path as you scroll and slowly on its own
      let dist = 0;
      let prev = at(0);
      for (let i = 0; i < N; i++) {
        const u1 = (i + 1) / N;
        const cur = at(u1);
        const seg = Math.hypot(cur.x - prev.x, cur.y - prev.y);
        const twist = 0.72 + 0.28 * Math.cos(t * 0.6 + st.ph + u1 * 5.2); // the strip turns a little as it travels, so it reads as film in space
        const hwA = st.hw * (0.72 + 0.28 * Math.cos(t * 0.6 + st.ph + (i / N) * 5.2));
        const hwB = st.hw * twist;
        const a = { x: prev.x - prev.ty * hwA, y: prev.y + prev.tx * hwA };
        const b = { x: cur.x - cur.ty * hwB, y: cur.y + cur.tx * hwB };
        const c = { x: prev.x + prev.ty * hwA, y: prev.y - prev.tx * hwA };
        const sw = Math.max(1, seg * (TEX_H / (st.hw * 2)));
        const u0 = (((dist * (TEX_H / (st.hw * 2)) + run) % TEX_W) + TEX_W) % TEX_W;
        const paint = (sx: number, sWidth: number, off: number): void => {
          const kk = sWidth / sw;
          ctx.setTransform(((b.x - a.x) * kk) / sWidth, ((b.y - a.y) * kk) / sWidth, (c.x - a.x) / TEX_H, (c.y - a.y) / TEX_H, a.x + (b.x - a.x) * off, a.y + (b.y - a.y) * off);
          ctx.drawImage(this.tex, sx, 0, sWidth, TEX_H, 0, 0, sWidth + 0.8, TEX_H);
        };
        if (u0 + sw <= TEX_W) paint(u0, sw, 0);
        else {
          const first = TEX_W - u0;
          paint(u0, first, 0);
          paint(0, sw - first, first / sw);
        }
        dist += seg;
        prev = cur;
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
  }
}
