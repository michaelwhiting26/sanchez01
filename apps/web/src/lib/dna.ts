/**
 * DNA core: a double helix fixed at the centre of the page, behind the sections, driven by scroll. The hero fingerprint lets go of ONE thread, which
 * unwinds into two strands that turn as you scroll (strands pass in front of and behind each other, rungs fade edge-on), drawn in running stitch.
 * It steps back while the workshop gallery fills the screen, and narrows into a single thread at the bag's chain ring, where the chain takes over.
 * One fixed layer behind the page; the scroll position is the only input. Draws only while visible; reduced motion draws a still frame.
 */
type Rgb = readonly [number, number, number];
const RUST: Rgb = [196, 85, 58];
const GOLD: Rgb = [201, 164, 92];
const CREAM: Rgb = [243, 234, 220];

const smooth = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const rgba = (c: Rgb, a: number): string => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;

interface Pt {
  x: number;
  y: number;
  depth: number;
}

export class DnaCore {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly abort = new AbortController();
  private readonly reduce: boolean;
  private readonly coarse: boolean;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private readonly pitch = 210;
  private readonly phase0 = 0;
  private dirty = true;
  private readonly t0 = performance.now();
  private fieldEnd = 3000;
  private last = 0;
  private visible = true;
  private cleared = false;
  private raf = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    opts: { reducedMotion: boolean; coarsePointer: boolean },
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("DnaCore: 2D canvas is not available");
    this.ctx = ctx;
    this.reduce = opts.reducedMotion;
    this.coarse = opts.coarsePointer;
  }

  start(): void {
    const { signal } = this.abort;
    this.size();
    window.addEventListener("resize", () => this.size(), { signal });
    window.addEventListener("load", () => this.size(), { signal });
    window.addEventListener("scroll", () => (this.dirty = true), { passive: true, signal });
    document.addEventListener("visibilitychange", () => (this.visible = !document.hidden), { signal });
    if ("ResizeObserver" in window) {
      let timer = 0;
      const ro = new ResizeObserver(() => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => this.size(), 250);
      });
      ro.observe(document.body);
      signal.addEventListener("abort", () => ro.disconnect());
    }
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy(): void {
    this.abort.abort();
    cancelAnimationFrame(this.raf);
  }

  private size(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, this.coarse ? 1.5 : 2);
    this.w = document.documentElement.clientWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.dirty = true;
    let end = 0;
    document.querySelectorAll(".bag-punch, .lgc-track, .sz-marquee, .curved-loop, [data-hero-rings]").forEach((e) => {
      end = Math.max(end, e.getBoundingClientRect().bottom + window.scrollY);
    });
    this.fieldEnd = end || 3000;
  }

  private readonly loop = (now: number): void => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible || (this.coarse && now - this.last < 33)) return;
    this.last = now;
    if (window.scrollY > this.fieldEnd) {
      if (!this.cleared) {
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.cleared = true;
      }
      return;
    }
    this.cleared = false;
    if (this.reduce && !this.dirty) return;
    this.dirty = false;
    this.draw(now);
  };

  private draw(now: number): void {
    const { ctx, w, h, pitch } = this;
    const y = window.scrollY;
    const vh = h;
    const grow = smooth(vh * 0.12, vh * 0.95, y); // 0 in the hero, 1 one screen down: single thread to two strands
    const fadeOut = 1 - smooth(this.fieldEnd - vh * 1.4, this.fieldEnd - vh * 0.4, y); // gone once the transparent sections are behind you
    let ringY = 1e9; // where the bag's chain ring hangs: the helix narrows to a single thread there and stops
    const bag = document.querySelector(".bag-punch");
    if (bag) {
      const view = bag.querySelector("[data-bag-view]") ?? bag;
      const r = view.getBoundingClientRect();
      ringY = r.top + r.height * 0.118;
    }
    let lgcK = 1; // gone while the workshop gallery is being scrolled through
    const lgc = document.querySelector(".lgc-track");
    if (lgc) {
      const lr = lgc.getBoundingClientRect();
      const cover = Math.max(0, Math.min(lr.bottom, vh) - Math.max(lr.top, 0)) / vh;
      lgcK = 1 - smooth(0.12, 0.55, cover);
    }
    const alpha = grow * fadeOut * lgcK;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (alpha < 0.01) return;
    const cx = w / 2;
    const amp = Math.min(w * 0.16, 84) * grow;
    const tilt = this.reduce ? 0 : ((now - this.t0) / 1000) * 0.32;
    const turn = ((y / pitch) * 2 * Math.PI * 0.55) + tilt + this.phase0;
    const step = 4;
    const n = Math.ceil((h + 40) / step) + 1;
    const taperLen = Math.min(h * 0.55, 420);
    const ampAt = (yv: number): number => {
      const t = Math.max(0, Math.min(1, (ringY - yv) / taperLen));
      return amp * t * t * (3 - 2 * t); // full width far above the ring, a single thread at the ring
    };
    const A: Pt[] = [];
    const B: Pt[] = [];
    for (let i = 0; i < n; i++) {
      const yy = -20 + i * step;
      if (yy > ringY) break; // nothing below the ring: the chain and the bag take over
      const a = (yy / pitch) * 2 * Math.PI + turn;
      const s = Math.sin(a);
      const c = Math.cos(a);
      const am = ampAt(yy);
      A.push({ x: cx + am * s, y: yy, depth: c });
      B.push({ x: cx - am * s, y: yy, depth: -c });
    }
    // rungs, back to front by depth so the helix reads as 3D
    ctx.setLineDash([]);
    ctx.lineCap = "round";
    for (let ry = -20; ry < h + 20 && ry < ringY; ry += 20) {
      const ra = (ry / pitch) * 2 * Math.PI + turn;
      const dep = Math.cos(ra);
      const am2 = ampAt(ry);
      const x1 = cx + am2 * Math.sin(ra);
      const x2 = cx - am2 * Math.sin(ra);
      if (am2 < 3) continue;
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(CREAM, alpha * (0.06 + 0.22 * Math.abs(dep)));
      ctx.beginPath();
      ctx.moveTo(x1, ry);
      ctx.lineTo(x2, ry);
      ctx.stroke();
      // the little knots where a rung meets a strand
      ctx.fillStyle = rgba(dep > 0 ? RUST : GOLD, alpha * (0.25 + 0.5 * Math.abs(dep)));
      ctx.beginPath();
      ctx.arc(x1, ry, 1.6 + 1.2 * Math.max(0, dep), 0, 7);
      ctx.fill();
      ctx.fillStyle = rgba(dep > 0 ? GOLD : RUST, alpha * (0.25 + 0.5 * Math.abs(dep)));
      ctx.beginPath();
      ctx.arc(x2, ry, 1.6 + 1.2 * Math.max(0, -dep), 0, 7);
      ctx.fill();
    }
    // each strand in short segments so thickness and brightness follow depth: far = fine and dim, near = bold and bright; running stitch dashes
    const strand = (P: readonly Pt[], col: Rgb): void => {
      for (let i = 0; i < P.length - 1; i++) {
        const p = P[i];
        const q = P[i + 1];
        if (!p || !q) continue;
        const k = 0.5 + 0.5 * ((p.depth + q.depth) / 2); // 0 far to 1 near
        if (Math.floor(i / 2) % 3 === 2) continue; // the gap in the running stitch
        ctx.strokeStyle = rgba(col, alpha * (0.18 + 0.82 * k));
        ctx.lineWidth = 1 + 2.2 * k;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    };
    if (Math.cos(turn) >= 0) {
      strand(B, GOLD);
      strand(A, RUST);
    } else {
      strand(A, RUST);
      strand(B, GOLD);
    }
  }
}
