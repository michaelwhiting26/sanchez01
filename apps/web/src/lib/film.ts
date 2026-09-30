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
 * A tornado of film: a vertical helix on the page's centre axis, tight and frequent, running from the bottom of the hero down through the page to the
 * end of the gallery. The back of every coil is drawn as full film behind the page; the front is only an outline (about 5%), so nothing ever stands in
 * front of the gallery. Two fixed viewport canvases show the window of the helix that is on screen, so the scroll carries you down the spiral and also
 * rolls it round its axis.
 */
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
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.draw();
    });
  }

  private resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
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

  draw(): void {
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
    const viewTop = scrollY;
    const viewBot = scrollY + window.innerHeight;
    this.active = viewBot > yStart && viewTop < yEnd;
    if (!this.active || this.o.reduced) return;

    const vh = window.innerHeight;
    const R = Math.min(window.innerWidth * 0.36, vh * 0.3) * dpr; // a tight coil round the centre axis
    const pitch = vh * 0.5 * dpr; // one full turn every half screen: frequent
    const bandH = pitch * 0.4; // a fine ribbon, with air between the coils
    const f = R * 3.6;
    const N = 72; // slices per turn
    const dphi = (Math.PI * 2) / N;
    const dy = pitch / N;
    const roll = (scrollY / vh) * Math.PI * 1.2; // the scroll also rolls the tornado round its axis
    const cx = w / 2;
    const sw = R * dphi * (TEX_H / bandH); // texture pixels per slice, so the numbers keep their proportions
    const proj = (phi: number, yPage: number): { x: number; y: number; z: number } => {
      const z = R * Math.sin(phi);
      const s = f / (f - z);
      const yRel = (yPage - scrollY) * dpr - h / 2;
      return { x: cx + R * Math.cos(phi) * s, y: h / 2 + yRel * s, z };
    };
    // fade the coil in and out at both ends so it grows out of the hero and finishes at the gallery
    const endFade = (yPage: number): number => Math.min(1, Math.max(0, Math.min((yPage - yStart) / (vh * 0.4), (yEnd - yPage) / (vh * 0.4))));

    const pitchCss = pitch / dpr;
    const dyCss = pitchCss / N;
    const j0 = Math.max(0, Math.floor((viewTop - vh * 0.3 - yStart) / dyCss));
    const j1 = Math.ceil((viewBot + vh * 0.3 - yStart) / dyCss);
    interface Seg {
      z: number;
      j: number;
    }
    const segs: Seg[] = [];
    for (let j = j0; j <= j1; j++) {
      const yPage = yStart + j * dyCss;
      if (yPage > yEnd) break;
      const phi = j * dphi + roll;
      segs.push({ z: R * Math.sin(phi + dphi / 2), j });
    }
    segs.sort((a, b) => a.z - b.z);
    for (const { z, j } of segs) {
      const yPage = yStart + j * dyCss;
      const fade = endFade(yPage);
      if (fade <= 0.01) continue;
      const phi0 = j * dphi + roll;
      const phi1 = phi0 + dphi;
      const ya = yPage - bandH / dpr / 2;
      const yb = yPage + dyCss - bandH / dpr / 2;
      const a = proj(phi0, ya);
      const b = proj(phi1, yb);
      const c = proj(phi0, ya + bandH / dpr);
      const d2 = proj(phi1, yb + bandH / dpr);
      const back = z < 0;
      const ctx = back ? bctx : fctx;
      const u0 = (j * sw) % TEX_W;
      // the front of a coil is almost glass (5%): just an outline; the back is full film
      ctx.globalAlpha = (back ? 1 : 0.05) * fade;
      const paint = (sx: number, sWidth: number, off: number): void => {
        const k = sWidth / sw;
        ctx.setTransform(((b.x - a.x) * k) / sWidth, ((b.y - a.y) * k) / sWidth, (c.x - a.x) / TEX_H, (c.y - a.y) / TEX_H, a.x + (b.x - a.x) * off, a.y + (b.y - a.y) * off);
        ctx.drawImage(this.tex, sx, 0, sWidth, TEX_H, 0, 0, sWidth + 0.8, TEX_H);
      };
      if (u0 + sw <= TEX_W) paint(u0, sw, 0);
      else {
        const first = TEX_W - u0;
        paint(u0, first, 0);
        paint(0, sw - first, first / sw);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (back) {
        const depth = (z + R) / (2 * R);
        ctx.globalAlpha = fade;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(d2.x, d2.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fillStyle = `rgba(6,3,1,${(0.55 * (1 - depth)).toFixed(3)})`;
        ctx.fill();
      } else {
        // the thin outline of the front strip: the two long edges
        ctx.globalAlpha = 0.3 * fade;
        ctx.strokeStyle = "rgba(255,181,112,1)";
        ctx.lineWidth = Math.max(1, dpr * 0.8);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(d2.x, d2.y);
        ctx.stroke();
      }
    }
    bctx.globalAlpha = 1;
    fctx.globalAlpha = 1;
  }
}
