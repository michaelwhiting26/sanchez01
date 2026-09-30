/**
 * The Sanchez hero field.
 *
 * One fixed canvas behind the whole top of the page. A ring map (R = distance from the SANCHEZ word, G = the outline, B = the letter interiors)
 * defines the hero; above and below it the ridges keep going, so the pattern flows from the word down the page as one field.
 * Every dot is classified each frame into a colour bucket, then each bucket is drawn in a single pass.
 *
 * Layers, in classification order per dot: outline (tan, with a second coat of spray), letter interior (the flag, sprayed by a wandering hand),
 * cloud bank (intro only), overspray halo just outside the outline, then the ridges (running stitch with soft edges, waves, smooth noise flow).
 *
 * The engine is framework-free and owns no React state. `HeroField` mounts it. Debug overrides replace the prototype's window globals.
 */
import {
  CLOUDS,
  FIELD,
  FLAG_PALETTE,
  FLOW,
  INTERACTION,
  ORBIT,
  RIDGES,
  RING_MAP,
  SPRAY,
  INTRO,
  TAN,
  WAVES,
  type Rgb,
} from "./config";
import { FlagLookup, loadFlagIndices } from "./flag";
import { WaterPaint } from "./water";
import { IntroSprites, segmentLetters, type IntroGeom } from "./intro";
import { createSeededNoise, fbm3, hashSeed, type Noise3 } from "./noise";
import { createWaveTables, fillWaveTables, hash1 } from "./waves";

/** Typed-array reads return `number | undefined` under noUncheckedIndexedAccess; in the hot loops every index is bounds-checked by construction, so 0 is a safe default. */
const at = (a: ArrayLike<number>, i: number): number => a[i] ?? 0;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

export interface HeroOverrides {
  /** Replace window.scrollY (dev and screenshots). */
  scrollY?: number | undefined;
  /** Freeze the first spray pass at this progress (0..1). */
  spray?: number | undefined;
  /** Force the workshop-orbit envelope (0..1). */
  orbit?: number | undefined;
  /** Add to the orbit spin, in units of 12 cells of flow. */
  spin?: number | undefined;
  /** Freeze the load sequence at this many ms from its start (screenshots and tests). */
  introMs?: number | undefined;
}

interface Ripple {
  x: number;
  y: number;
  start: number;
}

export interface HeroEngineOptions {
  canvas: HTMLCanvasElement;
  /** The hero section, whose height sets the map's scale. */
  hero: HTMLElement;
  reducedMotion: boolean;
  coarsePointer: boolean;
}

export class HeroEngine {
  readonly overrides: HeroOverrides = {};

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly hero: HTMLElement;
  private readonly reduce: boolean;
  private readonly coarse: boolean;
  private readonly abort = new AbortController();

  // ring map
  private mw = 0;
  private mh = 0;
  private mapDist = new Float32Array(0);
  private mapOutline = new Uint8Array(0);
  private mapLetters = new Uint8Array(0);
  private sx0 = 0;
  private sx1 = 0;

  // the page-long grid
  private rows = 0;
  private r0 = 0;
  private ridgeDist = new Float32Array(0);
  private ridgeAngle = new Float32Array(0);
  private seed = new Float32Array(0);
  private fpA = 1.7;
  private fpB = 4.1;
  private fpC = 0.6;
  private gridKey = "";

  // what is on screen now
  private nRows = 0;
  private topRow = 0;
  private sub = 0;
  private bucketOf = new Int16Array(0);
  private order = new Int32Array(0);
  private counts = new Int32Array(0);
  private offX = new Float32Array(0);
  private offY = new Float32Array(0);

  // canvas geometry
  private cell = 1;
  private ox = 0;
  private dpr = 1;
  private cw = 0;
  private ch = 0;
  private fieldEnd = 1e9;

  // colour buckets: [ridge/cloud shades (levels x warms)] [flag bright x3] [tan outline] [flag dim x3]
  private readonly styles: string[] = [];
  private readonly nb0: number;
  private readonly nBuckets: number;

  // motion state
  private readonly flag = new FlagLookup();
  private readonly waveTables = createWaveTables();
  private noise: Noise3 | null = null;
  private warp = new Float32Array(0);
  private lgcTrack: Element | null = null;
  private sprayStart = 0;
  private intro: IntroSprites | null = null;
  private ti = 0;
  private water: WaterPaint | null = null;
  private lastT = 0;
  private readonly stats = { letters: 0, coat: 0, halo: 0 };
  private sigEl: HTMLElement | null = null;
  private introGeom: IntroGeom | null = null;
  private cursor = { x: 0, y: 0, active: false };
  private ripples: Ripple[] = [];
  private moving = false;
  private raf = 0;
  private lastFrame = 0;
  private cleared = false;
  private ready = false;
  private resizeTimer = 0;

  constructor(options: HeroEngineOptions) {
    const ctx = options.canvas.getContext("2d");
    if (!ctx) throw new Error("HeroEngine: 2D canvas is not available");
    this.canvas = options.canvas;
    this.ctx = ctx;
    this.hero = options.hero;
    this.reduce = options.reducedMotion;
    this.coarse = options.coarsePointer;

    const { levels, warms } = RIDGES;
    this.nb0 = (levels + 1) * warms;
    this.nBuckets = this.nb0 + 2 * FLAG_PALETTE.length + 1;
    this.buildStyles();
    this.counts = new Int32Array(this.nBuckets + 1);
  }

  // ---------------------------------------------------------------- lifecycle

  async start(): Promise<void> {
    const port = window.innerWidth < window.innerHeight;
    // The noise, flag raster and ring map load in parallel; the field starts when the map is ready.
    void import("simplex-noise").then(() => {
      this.noise = createSeededNoise("sanchez");
    });
    void loadFlagIndices().then((indices) => {
      if (indices) this.flag.set(indices);
    });
    const image = new Image();
    image.decoding = "async";
    const loaded = new Promise<boolean>((resolve) => {
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
    });
    image.src = port ? RING_MAP.port : RING_MAP.land;
    if (!(await loaded) || this.abort.signal.aborted) return;
    this.readMap(image);
    this.sprayStart = performance.now();
    this.attach();
    this.resize(true);
    this.canvas.classList.add("is-ready");
    this.ready = true;
    if (!this.reduce) {
      this.sigEl = this.hero.querySelector<HTMLElement>(".sig");
      this.hero.classList.add("is-intro"); // hides "Custom" until the runner sprays it
      const sprites = new IntroSprites();
      void sprites.load(segmentLetters(this.mapLetters, this.mw, this.mh)).then((ok) => {
        if (this.abort.signal.aborted) return;
        if (ok) this.intro = sprites;
        else this.hero.classList.remove("is-intro"); // assets missing: show the plain hero
      });
    }
    if (!this.reduce) {
      const flag = this.flag;
      this.water = new WaterPaint({ mw: this.mw, mh: this.mh, letters: this.mapLetters, outline: this.mapOutline, dist: this.mapDist, colourAt: (u, v) => flag.colour(u, v), sx0: this.sx0, span: Math.max(1, this.sx1 - this.sx0), slope: SPRAY.slope });
    }
    if (this.reduce) this.draw(0);
    else this.raf = requestAnimationFrame(this.loop);
  }

  destroy(): void {
    this.abort.abort();
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.resizeTimer);
    this.canvas.classList.remove("is-ready");
    this.hero.classList.remove("is-intro");
    if (this.sigEl) this.sigEl.style.clipPath = "";
  }

  /** Reshape the ridges for a name: the same name always gives the same print. */
  setSeed(name: string): void {
    const h = hashSeed(name || "sanchez");
    this.fpA = ((h & 1023) / 1023) * 6.28;
    this.fpB = (((h >> 10) & 1023) / 1023) * 6.28;
    this.fpC = (((h >> 20) & 511) / 511) * 6.28;
    if (this.ridgeDist.length) this.buildFingerprint();
  }

  /** Paint dots of the last frame: in the lettering, and outside it (second coat over the outline plus stray halo). `overflow` is the outside share. */
  measure(): { letters: number; outside: number; overflow: number } {
    const { letters, coat, halo } = this.stats;
    const outside = coat + halo;
    return { letters, outside, overflow: letters + outside > 0 ? outside / (letters + outside) : 0 };
  }

  /** Draw one frame now (a hidden tab pauses requestAnimationFrame, so tests and screenshots call this). */
  drawNow(time = performance.now()): void {
    if (this.ready) this.draw(time);
  }

  // ------------------------------------------------------------------ set-up

  private buildStyles(): void {
    const { levels, warms } = RIDGES;
    const [r, g, b] = TAN;
    for (let lv = 0; lv <= levels; lv++) {
      const k = lv / levels;
      const shade = `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`; // the warm grades are all tan now (both ends of the old cream-to-gold ramp)
      for (let w = 0; w < warms; w++) this.styles.push(shade);
    }
    for (const c of FLAG_PALETTE) this.styles.push(`rgb(${c[0]},${c[1]},${c[2]})`);
    this.styles.push(`rgb(${r},${g},${b})`); // the tan outline, kept separate from the paint
    for (const c of FLAG_PALETTE) {
      const d = SPRAY.dimCoat;
      this.styles.push(`rgb(${Math.round(c[0] * d)},${Math.round(c[1] * d)},${Math.round(c[2] * d)})`); // the thinner coat
    }
  }

  private readMap(image: HTMLImageElement): void {
    const mw = image.width;
    const mh = image.height;
    const n = mw * mh;
    const c = document.createElement("canvas");
    c.width = mw;
    c.height = mh;
    const cx = c.getContext("2d");
    if (!cx) return;
    cx.drawImage(image, 0, 0);
    const px = cx.getImageData(0, 0, mw, mh).data;
    this.mw = mw;
    this.mh = mh;
    this.mapDist = new Float32Array(n);
    this.mapOutline = new Uint8Array(n);
    this.mapLetters = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      this.mapDist[i] = at(px, i * 4);
      this.mapOutline[i] = at(px, i * 4 + 1) > 127 ? 1 : 0;
      this.mapLetters[i] = at(px, i * 4 + 2) > 127 ? 1 : 0;
    }
    let lo = mw;
    let hi = 0;
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) {
        if (this.mapOutline[y * mw + x]) {
          if (x < lo) lo = x;
          if (x > hi) hi = x;
        }
      }
    }
    this.sx0 = lo;
    this.sx1 = hi;
  }

  private attach(): void {
    const { signal } = this.abort;
    window.addEventListener("resize", () => this.resize(false), { signal });
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(() => {
        window.clearTimeout(this.resizeTimer);
        this.resizeTimer = window.setTimeout(() => this.resize(false), 250);
      });
      ro.observe(document.body);
      signal.addEventListener("abort", () => ro.disconnect());
    }
    window.addEventListener(
      "pointermove",
      (e) => {
        if (window.scrollY > this.fieldEnd) return;
        this.cursor.x = e.clientX * this.dpr;
        this.cursor.y = e.clientY * this.dpr;
        this.cursor.active = true;
      },
      { passive: true, signal },
    );
    document.addEventListener("pointerleave", () => (this.cursor.active = false), { signal });
    window.addEventListener(
      "pointerup",
      (e) => {
        const target = e.target instanceof Element ? e.target : null;
        const inert = target?.closest("a,button,input,select,textarea,label,[data-lgc],[data-bag-view],dialog");
        if (window.scrollY > this.fieldEnd || inert) return;
        this.ripples.push({ x: e.clientX * this.dpr, y: e.clientY * this.dpr, start: performance.now() });
        if (e.pointerType !== "mouse") this.cursor.active = false;
      },
      { passive: true, signal },
    );
    window.addEventListener(
      "scroll",
      () => {
        if (this.reduce && this.mw && window.scrollY <= this.fieldEnd + window.innerHeight) this.draw(0);
      },
      { passive: true, signal },
    );
  }

  /** The bottom of the last transparent section: below that the sections are solid, so nothing needs drawing. */
  private measureEnd(): number {
    let end = 0;
    document.querySelectorAll("[data-hero-rings], .curved-loop, .lgc-track, .sz-marquee, .bag-punch").forEach((el) => {
      end = Math.max(end, el.getBoundingClientRect().bottom + window.scrollY);
    });
    return end || window.innerHeight;
  }

  private resize(force: boolean): void {
    if (!this.mw) return;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const heroH = this.hero.getBoundingClientRect().height || vh;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.coarse ? 1.5 : 2);
    if (force || this.cw !== Math.round(vw * this.dpr) || this.ch !== Math.round(vh * this.dpr)) {
      this.cw = Math.round(vw * this.dpr);
      this.ch = Math.round(vh * this.dpr);
      this.canvas.width = this.cw;
      this.canvas.height = this.ch;
    }
    this.cell = Math.max(this.cw / this.mw, (heroH * this.dpr) / this.mh);
    this.ox = (this.cw - this.mw * this.cell) / 2;
    const mapTop = (heroH * this.dpr - this.mh * this.cell) / 2;
    this.r0 = Math.round(mapTop / this.cell);
    this.fieldEnd = this.measureEnd();
    const rows = Math.ceil(((this.fieldEnd + vh) * this.dpr) / this.cell) + 4;
    const key = [this.cw, this.ch, Math.round(this.cell * 100), rows, this.r0].join();
    if (key !== this.gridKey || force) {
      this.gridKey = key;
      this.buildGrid(rows);
    }
    const win = Math.ceil(this.ch / this.cell) + 3;
    if (win !== this.nRows || !this.bucketOf.length) {
      this.nRows = win;
      const m = this.mw * win;
      this.bucketOf = new Int16Array(m);
      this.order = new Int32Array(m);
      this.offX = new Float32Array(m);
      this.offY = new Float32Array(m);
    }
    if (this.reduce) this.draw(0);
  }

  private buildGrid(rows: number): void {
    this.rows = rows;
    const n = this.mw * rows;
    this.ridgeDist = new Float32Array(n);
    this.ridgeAngle = new Float32Array(n);
    this.seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const h = Math.sin(i * 12.9898) * 43758.5453;
      this.seed[i] = h - Math.floor(h);
    }
    this.buildFingerprint();
  }

  /** The ridges are a fingerprint: rings round a core (the word), wobbled so they are never perfect ellipses. Beyond the word they fan out as arches. */
  private buildFingerprint(): void {
    const { mw, mh, r0 } = this;
    const cx = mw / 2;
    const cy = r0 + mh / 2;
    for (let y = 0, i = 0; y < this.rows; y++) {
      const m = y - r0;
      for (let x = 0; x < mw; x++, i++) {
        let d = m < 0 ? at(this.mapDist, x) + -m : m >= mh ? at(this.mapDist, (mh - 1) * mw + x) + (m - mh + 1) : at(this.mapDist, m * mw + x);
        if (m < 0 || m >= mh) {
          const dyo = m < 0 ? -m : m - mh + 1;
          let wA = Math.min(1, dyo / (mh * 1.2));
          wA = wA * wA * (3 - 2 * wA);
          const dfar = Math.hypot((x - cx) * 0.82, dyo + mh * 0.5);
          d = d * (1 - wA) + dfar * wA;
        }
        const th = Math.atan2(y - cy, x - cx);
        this.ridgeDist[i] = d + 1.15 * Math.sin(th * 3 + this.fpA) + 0.75 * Math.sin(th * 5 + d * 0.045 + this.fpB) + 0.55 * Math.sin(d * 0.09 + th * 2 + this.fpC);
        this.ridgeAngle[i] = th;
      }
    }
  }

  // ------------------------------------------------------------ interaction

  /** Push the dots on screen away from the cursor and ripples; ease back when the force goes. */
  private step(now: number): void {
    this.moving = false;
    for (let k = this.ripples.length - 1; k >= 0; k--) {
      const r = this.ripples[k];
      if (r && now - r.start >= INTERACTION.rippleDurationMs) this.ripples.splice(k, 1);
    }
    const nr = this.ripples.length;
    const mul = nr ? 1 + 0.5 * (nr - 1) : 0;
    const { dpr, cell, sub, ox } = this;
    const CR = INTERACTION.cursorRadius * dpr;
    const CR2 = CR * CR;
    const CF = INTERACTION.cursorForce * dpr;
    const RW = INTERACTION.rippleWidth * dpr;
    const RF = INTERACTION.rippleForce * dpr;
    for (let y = 0, i = 0; y < this.nRows; y++) {
      const by = y * cell - sub + cell * 0.5;
      for (let x = 0; x < this.mw; x++, i++) {
        const bucket = at(this.bucketOf, i);
        if (bucket < 0 && this.offX[i] === 0 && this.offY[i] === 0) continue;
        const bx = ox + (x + 0.5) * cell;
        let fx = 0;
        let fy = 0;
        if (this.cursor.active) {
          const vx = bx + at(this.offX, i) - this.cursor.x;
          const vy = by + at(this.offY, i) - this.cursor.y;
          const d2 = vx * vx + vy * vy;
          if (d2 > 0.1 && d2 < CR2) {
            const d = Math.sqrt(d2);
            const f = (1 - d / CR) ** 3 * CF;
            fx += (vx / d) * f;
            fy += (vy / d) * f;
          }
        }
        for (let r = 0; r < nr; r++) {
          const rp = this.ripples[r];
          if (!rp) continue;
          const el = now - rp.start;
          const rad = (el / 1000) * INTERACTION.rippleSpeed * dpr;
          const life = 1 - el / INTERACTION.rippleDurationMs;
          const sx = bx - rp.x;
          const sy = by - rp.y;
          const dd = Math.sqrt(sx * sx + sy * sy);
          if (dd < 0.1) continue;
          const band = Math.abs(dd - rad);
          if (band < RW) {
            const wf = (1 - band / RW) * life * RF * mul;
            fx += (sx / dd) * wf;
            fy += (sy / dd) * wf;
          }
        }
        let ox2 = at(this.offX, i);
        let oy2 = at(this.offY, i);
        ox2 += (fx - ox2) * INTERACTION.lerp;
        oy2 += (fy - oy2) * INTERACTION.lerp;
        if (Math.abs(ox2) < 0.01) ox2 = 0;
        if (Math.abs(oy2) < 0.01) oy2 = 0;
        this.offX[i] = ox2;
        this.offY[i] = oy2;
        if (ox2 !== 0 || oy2 !== 0) this.moving = true;
      }
    }
  }

  private readonly loop = (t: number): void => {
    this.raf = requestAnimationFrame(this.loop);
    if (document.hidden || (this.coarse && t - this.lastFrame < 32)) return;
    this.lastFrame = t;
    if (window.scrollY > this.fieldEnd) {
      if (!this.cleared) {
        this.ctx.clearRect(0, 0, this.cw, this.ch);
        this.cleared = true;
      }
      return; // below the last transparent section nothing shows: skip the work
    }
    this.cleared = false;
    if (this.cursor.active || this.ripples.length || this.moving) this.step(t);
    this.draw(t);
  };

  // ------------------------------------------------------------------- draw

  private draw(t: number): void {
    const { mw, mh, sx0, sx1, cell, dpr, reduce } = this;
    const scrollY = this.overrides.scrollY ?? window.scrollY;
    const sy0 = scrollY * dpr;
    this.topRow = Math.max(0, Math.floor(sy0 / cell));
    this.sub = sy0 - this.topRow * cell;
    const { topRow, sub } = this;
    const seconds = t / 1000;
    const maxD = Math.hypot(mw, mh) * 0.5;
    const drift = reduce ? 0 : seconds * RIDGES.drift;
    this.counts.fill(0);

    // ---- spray timeline
    const ti = reduce ? 1e9 : (this.overrides.introMs ?? t - (this.sprayStart || t));
    this.ti = ti;
    const tp = ti - INTRO.sprayStartMs;
    let sp = reduce ? 1 : Math.min(1, Math.max(0, tp / SPRAY.durationMs));
    const sprayOverride = this.overrides.spray;
    if (sprayOverride !== undefined) sp = sprayOverride;
    // clouds hold at load, melt away first, and only then does the spray start
    let cf = reduce ? 0 : 1 - clamp01((ti - INTRO.cloudHoldMs) / INTRO.cloudFadeMs);
    if (sprayOverride !== undefined) cf = 1 - clamp01((sprayOverride - 0.92) / 0.08);
    const sweeping = !reduce && sp > 0.005 && sp < 1;
    const tn = Math.max(0, tp) / 1000;

    // ---- the hand: two nozzles that drift over the word, moving closer (tight, dense) and further (wide, soft)
    const hc = 0.5 + 0.5 * Math.sin(tn * 0.55 + 1.3) * Math.cos(tn * 0.21);
    const hR = 4 + 20 * (1 - hc);
    const hI = 0.45 + 0.55 * hc;
    const hx = sx0 + (sx1 - sx0) * (0.5 + 0.46 * Math.sin(tn * 0.31 - 0.9) + 0.06 * Math.sin(tn * 1.7));
    const hy = mh * (0.5 + 0.42 * Math.sin(tn * 0.83 + 2.0) * Math.cos(tn * 0.29));
    const hx2 = sx0 + (sx1 - sx0) * (0.5 + 0.46 * Math.sin(tn * 0.23 + 2.4));
    const hy2 = mh * (0.5 + 0.4 * Math.sin(tn * 0.61 - 0.5));
    const hR2 = 5 + 16 * (0.5 + 0.5 * Math.sin(tn * 0.4 + 0.7));
    const densAt = (xx: number, mm: number): number => {
      const a1 = xx - hx;
      const b1 = (mm - hy) * 1.5;
      const a2 = xx - hx2;
      const b2 = (mm - hy2) * 1.5;
      return Math.min(1, hI * Math.exp(-(a1 * a1 + b1 * b1) / (hR * hR)) + 0.7 * Math.exp(-(a2 * a2 + b2 * b2) / (hR2 * hR2)) + 0.18 + 0.16 * Math.sin(xx * 0.11 + mm * 0.07 + tn * 0.4));
    };
    const eOut = (v: number): number => {
      const c = clamp01(v);
      return c * c * (3 - 2 * c) * 0.35 + c * 0.65;
    };
    const SLOPE = SPRAY.slope;
    const PSMAX = sx1 - sx0 + Math.abs(SLOPE) * mh;
    const FF = sp >= 1 ? PSMAX + 40 : -8 + (PSMAX + 24) * eOut(sp);
    const FF2 = sp >= 1 ? PSMAX + 40 : FF - SPRAY.secondCoatLag;
    const span = Math.max(1, sx1 - sx0);

    // ---- wave sets (one per quarter) and the smooth noise flow
    const waveSeconds = tp / 1000 - (SPRAY.durationMs / 1000) * 0.7; // the first set starts just after the spray intro, as in the prototype
    fillWaveTables(this.waveTables, waveSeconds, reduce);
    const wcx = (sx0 + sx1) / 2;
    const wcy = mh / 2;
    const GS = FLOW.gridStep;
    const gcols = Math.ceil(mw / GS) + 2;
    const grows = Math.ceil(this.nRows / GS) + 2;
    if (this.warp.length !== gcols * grows) this.warp = new Float32Array(gcols * grows);
    const noise = this.noise;
    for (let gy = 0; gy < grows; gy++) {
      const prg = topRow + gy * GS;
      for (let gx = 0; gx < gcols; gx++) {
        this.warp[gy * gcols + gx] = noise && !reduce ? noise(gx * GS * 0.011, prg * 0.011, seconds * 0.045) + 0.5 * noise(gx * GS * 0.026 + 7, prg * 0.026, seconds * 0.08) : 0;
      }
    }

    // ---- workshop orbit: one shared flow while the gallery is on screen
    let env = 0;
    if (!reduce) {
      this.lgcTrack ??= document.querySelector(".lgc-track");
      const track = this.lgcTrack;
      if (track) {
        const tr = track.getBoundingClientRect();
        const pp = clamp01((window.innerHeight - tr.top) / (tr.height + window.innerHeight));
        env = Math.sin(Math.PI * pp) ** 1.1;
      }
    }
    if (this.overrides.orbit !== undefined) env = this.overrides.orbit;
    const ecx = mw / 2;
    const ecy = topRow + (this.ch / 2 + sub) / cell;
    const P = env * (seconds * ORBIT.flowSpeed + scrollY * ORBIT.flowScroll) + (this.overrides.spin ?? 0) * 12;
    const cax = Math.cos(ORBIT.axis);
    const sax = Math.sin(ORBIT.axis);
    const diag = Math.hypot(mw, this.ch / cell);
    const ea = diag * 0.56;
    const eb = ea * 0.48;
    const spin = P / ea;

    const { nb0 } = this;
    const NEON = FLAG_PALETTE.length;
    const { levels, warms, stitch, gap, period, width, floor } = RIDGES;
    const flag = this.flag;
    const seed = this.seed;
    const R = this.rows;
    const r0 = this.r0;
    const waveTabs = this.waveTables;
    const BINS = WAVES.bins;

    const stats = this.stats;
    stats.letters = 0;
    stats.coat = 0;
    stats.halo = 0;
    for (let y = 0, i = 0; y < this.nRows; y++) {
      const pr = topRow + y;
      const m = pr - r0;
      const inMap = m >= 0 && m < mh;
      const base = pr * mw;
      for (let x = 0; x < mw; x++, i++) {
        let b = -1;
        if (pr < R) {
          const ps0 = at(seed, base + x);
          if (inMap && this.mapOutline[m * mw + x]) {
            // the outline: pure tan, then one more coat of spray over it
            b = nb0 + NEON;
            const ps2 = x - sx0 + SLOPE * m;
            if (sp >= 1 || FF2 - ps2 + (ps0 - 0.5) * 6 > 0) {
              const h3 = (ps0 * 3571.7) % 1;
              const d3 = densAt(x, m);
              if (h3 < SPRAY.outlineCoat * (0.6 + 0.8 * d3)) {
                stats.coat++;
                const sl3 = flag.at((x - sx0) / span + (h3 - 0.5) * 0.006, m / mh + (ps0 - 0.5) * 0.018);
                b = ps0 < 0.3 + 0.7 * d3 ? nb0 + sl3 : nb0 + NEON + 1 + sl3; // tan still shows through where the coat is thin
              }
            }
          } else if (inMap && this.mapLetters[m * mw + x]) {
            // the black inside the letters: spray paint
            const ps = x - sx0 + SLOPE * m;
            const agep = FF - ps + (ps0 - 0.5) * 6;
            if (agep > 0 || sp >= 1) {
              const h2 = (ps0 * 7919.13) % 1;
              const dens = densAt(x, m);
              const covp = sp >= 1 ? 1 : Math.min(1, agep / 18);
              if (ps0 < (SPRAY.coverage + (1 - SPRAY.coverage) * dens) * covp) {
                // at least 84% of the letters are always sprayed; the hand only changes how dense and bright
                const sl = flag.at((x - sx0) / span + (h2 - 0.5) * 0.006, m / mh + (ps0 - 0.5) * 0.018);
                stats.letters++;
                // wet paint: travelling swells whose crests sharpen to a head (lit, with a flash of foam), troughs sit dim
                const swell = Math.sin(x * 0.09 + m * 0.05 - tn * 1.6) + 0.6 * Math.sin(x * 0.05 - m * 0.09 + tn * 1.1 + 1.7);
                const wet = reduce || sp <= 0 ? 0 : ((swell + 1.6) / 3.2) ** 3.5;
                if (wet > 0.8 && h2 < 0.4) b = nb0 + 2; // foam at the crest: the flag's white
                else b = h2 < 0.22 + 0.78 * dens + 0.7 * wet - 0.2 * (1 - wet) ? nb0 + sl : nb0 + NEON + 1 + sl;
              }
            }
          } else {
            let dw = at(this.ridgeDist, base + x);
            let tv = at(this.ridgeAngle, base + x);
            let vf = 0;
            if (env > 0.01) {
              const sxp = x - P * cax;
              const syp = pr - P * sax;
              const dxc = x - ecx;
              const dyc = pr - ecy;
              const along = dxc * cax + dyc * sax;
              const across = -dxc * sax + dyc * cax;
              const u1 = along / ea;
              const v1 = across / eb;
              const ue = u1 / (1 + 0.14 * v1);
              const r2 = ue * ue + v1 * v1;
              let xf = sxp;
              let yf = syp;
              if (r2 < 1) {
                const z = Math.sqrt(1 - r2);
                const lat = Math.asin(v1);
                const lon = Math.atan2(ue, z) - spin;
                const cl2 = Math.cos(lat);
                const un = cl2 * Math.sin(lon) * (1 + 0.14 * v1);
                const rim = clamp01((Math.sqrt(r2) - 0.8) / 0.2);
                const keepW = 1 - rim * rim * (3 - 2 * rim);
                const al2 = un * ea;
                const ac2 = v1 * eb;
                const dxn = al2 * cax - ac2 * sax;
                const dyn = al2 * sax + ac2 * cax;
                xf = sxp + (ecx + dxn - sxp) * keepW;
                yf = syp + (ecy + dyn - syp) * keepW;
                vf = env * keepW * (0.4 + 0.6 * z);
              }
              const xr = Math.round(xf);
              const yr = Math.round(yf);
              const mr = yr - r0;
              if (xr >= 0 && xr < mw && yr >= 0 && yr < R && !(mr >= 0 && mr < mh)) {
                const i2 = yr * mw + xr;
                dw = at(this.ridgeDist, i2); // never sample from inside the word itself
                tv = at(this.ridgeAngle, i2);
              }
            }

            // the cloud bank (intro only)
            let cl = 0;
            if (cf > 0 && noise && dw > CLOUDS.innerCells && dw < CLOUDS.outerCells) {
              const cxn = x * 0.032;
              const cyn = pr * 0.05;
              const ctn = tn * 0.02;
              const f1 = fbm3(noise, cxn, cyn, ctn);
              const f2 = fbm3(noise, cxn - 0.06, cyn - 0.06, ctn);
              const lim = 10 + 40 * (0.5 + 0.5 * f1) + 8 * (0.5 + 0.5 * fbm3(noise, cxn * 2.4 + 5, cyn * 2.4, ctn * 1.4));
              const cness = Math.min(1, (lim - dw) / 9);
              if (cness > 0) {
                const shade = Math.min(1, Math.max(0.12, 0.55 + (f2 - f1) * 5));
                const body = 0.4 + 0.6 * Math.min(1, (lim - dw) / lim + 0.25);
                if (ps0 < (0.42 + 0.55 * cness * body) * cf) cl = Math.round(levels * Math.min(1, cness * (0.16 + 0.92 * shade * body)));
              }
            }
            // the overspray halo just outside the outline
            let halo = -1;
            if (cf < 1 && dw > CLOUDS.innerCells && dw < CLOUDS.innerCells + SPRAY.haloReach && (sp >= 1 || FF2 - (x - sx0 + SLOPE * m) > 0)) {
              const hd = densAt(x, m);
              const hh3 = (ps0 * 5813.3) % 1;
              if (hh3 < (1 - (dw - CLOUDS.innerCells) / SPRAY.haloReach) * SPRAY.haloShare * (0.5 + hd)) {
                stats.halo++;
                halo = nb0 + NEON + 1 + flag.at((x - sx0) / span, m / mh);
              }
            }
            if (cl > 0) b = cl * warms;
            else if (halo >= 0) b = halo;
            else if (dw > 2.2) {
              // ridges: running stitch with soft edges, waves, smooth flow
              const fxg = x / GS;
              const fyg = y / GS;
              const gx0 = Math.floor(fxg);
              const gy0 = Math.floor(fyg);
              const tx = fxg - gx0;
              const ty = fyg - gy0;
              const gi = gy0 * gcols + gx0;
              const wv = (at(this.warp, gi) * (1 - tx) + at(this.warp, gi + 1) * tx) * (1 - ty) + (at(this.warp, gi + gcols) * (1 - tx) + at(this.warp, gi + gcols + 1) * tx) * ty;
              const wt = clamp01((dw - 6) / (maxD * 0.25)); // the defined lines right at the word stay put; further out the thread drifts
              const flow = wv * FLOW.amplitude * wt;
              // this quarter's waves, blended across the axes
              const wIdx = Math.min(BINS, (dw * 2) | 0);
              let wxr = clamp01(((x - wcx) / 14 + 1) / 2);
              let wyr = clamp01(((m - wcy) / 12 + 1) / 2);
              wxr = wxr * wxr * (3 - 2 * wxr);
              wyr = wyr * wyr * (3 - 2 * wyr);
              const w0 = waveTabs[0];
              const w1 = waveTabs[1];
              const w2 = waveTabs[2];
              const w3 = waveTabs[3];
              const wav = w0 && w1 && w2 && w3 ? at(w0, wIdx) * (1 - wxr) * (1 - wyr) + at(w1, wIdx) * wxr * (1 - wyr) + at(w2, wIdx) * (1 - wxr) * wyr + at(w3, wIdx) * wxr * wyr : 0;
              const wv1 = Math.min(1, wav);
              const rel = dw - drift * (1 - env) + flow;
              const ring = Math.floor(rel / period);
              const ph = rel - ring * period;
              const WE = width * (1 + 0.55 * wv1) + 1.8 * Math.max(0, wv); // thicker in places where the flow swells
              const hr = hash1(ring * 45.164);
              const DL = Math.min(stitch + gap - 1.6, stitch * (1 + 1.5 * hr * hr)); // some ridges get much longer dashes
              const run = (tv * (dw + 34)) / (stitch + gap) + ring * 0.37 + ((Math.sin(ring * 12.9898) * 43758.5453) % 1);
              const seg = Math.floor(run);
              const gone = hash1(ring * 78.233 + seg * 37.719) < RIDGES.missing * (1 - wv1); // the odd stitch missing: none at the height of a wave
              const ph2 = ph > period - 2.2 ? ph - period : ph;
              const cov = 1 - Math.abs(ph2 - WE * 0.5) / (WE * 0.5 + 0.7);
              const dpos = (run - seg) * (stitch + gap);
              const dcv = Math.min(1, Math.min(dpos + 0.6 + 1.0 * wv1, DL + 1 * wv1 - dpos + 0.6));
              if (cov > 0.02 && dcv > 0.02 && !gone) {
                const fade = floor + (1 - floor) * Math.exp(-dw / (maxD * 0.34));
                const kk = Math.min(1, (0.4 * fade + wav * 0.55 * fade) * (1 + 1.3 * vf) * (cov * dcv) ** 0.7 * 1.2 * (1 + 0.5 * wv1));
                const warm = Math.min(1, Math.max(dw / (maxD * 0.55), vf * 1.15));
                const lv2 = Math.round(kk * levels);
                if (lv2 > 0) b = lv2 * warms + Math.round(warm * (warms - 1));
              }
            }
          }
        }
        this.bucketOf[i] = b;
        if (b >= 0) this.counts[b + 1] = at(this.counts, b + 1) + 1;
      }
    }

    for (let c = 1; c <= this.nBuckets; c++) this.counts[c] = at(this.counts, c) + at(this.counts, c - 1);
    const start = this.counts.slice();
    const nn = this.nRows * mw;
    for (let i = 0; i < nn; i++) {
      const bk = at(this.bucketOf, i);
      if (bk >= 0) {
        const s = at(start, bk);
        this.order[s] = i;
        start[bk] = s + 1;
      }
    }
    this.paint(sp, cf, sweeping, { hx, hy, hI, hR, FF, SLOPE, PSMAX, span, sy0 });
    if (this.water && !reduce && sp > 0) {
      this.water.advance(t - this.lastT, sp >= 1 ? PSMAX + 40 : FF);
      this.water.draw(this.ctx, cell, this.ox, this.r0, sy0);
    }
    this.lastT = t;
    this.drawIntro(ti, sy0, PSMAX, SLOPE);
  }

  /** The bags and runners on top of the field, and the reveal of "Custom" that follows the returning runner. */
  private drawIntro(ti: number, sy0: number, psmax: number, slope: number): void {
    const intro = this.intro;
    if (!intro || this.reduce) return;
    let sig: IntroGeom["sig"] = null;
    const el = this.sigEl;
    if (el) {
      const r = el.getBoundingClientRect();
      sig = { left: r.left * this.dpr, right: r.right * this.dpr, y: (r.top + r.height * 0.55) * this.dpr };
    }
    const g: IntroGeom = { cell: this.cell, ox: this.ox, r0: this.r0, sy0, cw: this.cw, mw: this.mw, mh: this.mh, sx0: this.sx0, sx1: this.sx1, slope, psmax, sig };
    this.introGeom = g;
    if (ti <= INTRO.returnArriveMs + INTRO.customPassMs + INTRO.returnExitMs + 200) intro.draw(this.ctx, ti, g);
    if (el) {
      const hidden = intro.signatureHidden(ti, g);
      el.style.clipPath = `inset(0 ${(hidden * 100).toFixed(2)}% 0 0)`; // inline beats the stylesheet's hidden default
    }
  }

  /** Draw every bucket in one pass, then the overspray mist. */
  private paint(
    sp: number,
    _cf: number,
    sweeping: boolean,
    hand: { hx: number; hy: number; hI: number; hR: number; FF: number; SLOPE: number; PSMAX: number; span: number; sy0: number },
  ): void {
    const { ctx, cell, dpr, sub, ox, mw, mh, r0, sx0, sx1, nb0 } = this;
    const NEON = FLAG_PALETTE.length;
    ctx.fillStyle = FIELD.background;
    ctx.fillRect(0, 0, this.cw, this.ch);
    const s = Math.max(1, cell * FIELD.dotScale);
    const pad = (cell - s) / 2;
    for (let bk = 0; bk < this.nBuckets; bk++) {
      const a = at(this.counts, bk);
      const z = at(this.counts, bk + 1);
      if (a === z) continue;
      ctx.fillStyle = this.styles[bk] ?? "#000";
      if (bk >= nb0) {
        // soft glow under each paint dot: a larger, faint copy
        ctx.globalAlpha = 0.14;
        const gs = s * 2.6;
        const gp = (cell - gs) / 2;
        for (let j = a; j < z; j++) {
          const n = at(this.order, j);
          const xg = n % mw;
          const yg = (n - xg) / mw;
          ctx.fillRect(ox + xg * cell + gp + at(this.offX, n), yg * cell - sub + gp + at(this.offY, n), gs, gs);
        }
        ctx.globalAlpha = 1;
      }
      ctx.globalAlpha = bk >= nb0 && bk !== nb0 + NEON ? SPRAY.paintAlpha : 1;
      for (let j = a; j < z; j++) {
        const n = at(this.order, j);
        const xx = n % mw;
        const yy = (n - xx) / mw;
        ctx.fillRect(ox + xx * cell + pad + at(this.offX, n), yy * cell - sub + pad + at(this.offY, n), s, s);
      }
    }
    ctx.globalAlpha = 1;
    if (sx1 <= sx0) return;
    const { hx, hy, hI, hR, FF, SLOPE, PSMAX, span, sy0 } = hand;
    const toRgba = (c: Rgb, a: number): string => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(2)})`;
    const colourAt = (u: number, v: number): Rgb => this.flag.colour(u, v);
    if (sp >= 1 && !this.reduce) {
      // fine overspray round the hand, thicker when it is close
      const mcH = colourAt((hx - sx0) / span, hy / mh);
      const nH = Math.round(70 * hI);
      for (let k = 0; k < nH; k++) {
        const ah = Math.random() * 6.2832;
        const rh = (Math.random() + Math.random() - 1) * hR * cell * 0.9;
        const aH = 0.1 + Math.random() * 0.3;
        const sz = (0.8 + Math.random() * 1.5) * dpr;
        ctx.fillStyle = toRgba(mcH, aH);
        ctx.fillRect(ox + (hx + 0.5) * cell + Math.cos(ah) * rh, (r0 + hy) * cell - sy0 + Math.sin(ah) * rh * 0.7, sz, sz);
      }
    }
    if (sweeping) {
      // the spray front: a fine mist and a few larger flecks along the nozzle line
      const mc = colourAt(clamp01(FF / PSMAX), 0.5);
      for (let k = 0; k < 240; k++) {
        const mrow = Math.random() * (mh + 4) - 2;
        const mx = ox + (sx0 + FF - SLOPE * mrow + 0.5 + (Math.random() + Math.random() - 1) * 9) * cell;
        const my = (r0 + mrow) * cell - sy0;
        ctx.fillStyle = toRgba(mc, 0.16 + Math.random() * 0.5);
        const ms = (0.8 + Math.random() * 1.7) * dpr;
        ctx.fillRect(mx, my, ms, ms);
      }
      for (let k = 0; k < 50; k++) {
        const mrow = Math.random() * (mh + 4) - 2;
        const mx = ox + (sx0 + FF - SLOPE * mrow + 0.5 + (Math.random() - 0.5) * 4) * cell;
        const my = (r0 + mrow) * cell - sy0;
        ctx.fillStyle = toRgba(mc, 0.35 + Math.random() * 0.4);
        ctx.fillRect(mx, my, 2.4 * dpr, 2.4 * dpr);
      }
    }
  }
}
