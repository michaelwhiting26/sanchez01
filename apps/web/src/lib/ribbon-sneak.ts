/**
 * The sneaking runner that walks right to left along the top of the curved ribbon.
 *
 * Everything is a pure function of scroll: progress through the ribbon section -> x -> foot point on the ribbon's own SVG path (a lookup table
 * built from getPointAtLength, offset up by the cap height so he stands on the lettering) -> tangent rotation (clamped) -> gait frame from ground
 * distance. Two glance beats hold his feet still and play the `look` sheet. Nothing is allocated per frame except the transform string.
 */
const FRAME = 320;
const FOOT_Y = 293.4;
const PX_PER_CYCLE = 213.3; // sneak sheet: ground distance one 12-frame cycle covers at FRAME size
const WALK_FRAMES = 12;
const WALK_COLS = 4;
const LOOK_FRAMES = 8;
const LOOK_COLS = 4;
const CAP_HEIGHT = 0.7 * 64; // Barlow Condensed caps, in the ribbon's 64px font-size units
const MAX_TILT = (12 * Math.PI) / 180;
const S0 = 0.04; // scroll progress through the section at which he enters, and leaves
const S1 = 0.97;
const BEATS = [0.4, 0.75]; // fraction of the crossing at which he freezes and glances back
const BEAT_LEN = 0.09; // share of the scroll range each glance holds
const SAMPLES = 96;
const SHEETS = { walk: "/assets/runner/sneak", look: "/assets/runner/look" } as const;

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

function bgPositions(frames: number, cols: number, size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < frames; i++) out.push(`${-(i % cols) * size}px ${-Math.floor(i / cols) * size}px`);
  return out;
}

const SHADED = false;

export class RibbonSneak {
  private readonly xs = new Float32Array(SAMPLES);
  private readonly ys = new Float32Array(SAMPLES);
  private readonly as = new Float32Array(SAMPLES);
  private readonly walkEl: HTMLElement;
  private readonly lookEl: HTMLElement;
  private readonly abort = new AbortController();
  private walkPos: string[] = [];
  private lookPos: string[] = [];
  private size = 0;
  private scale = 1;
  private svgTop = 0;
  private width = 0;
  private measured = false;
  private raf = 0;
  private shown = false;
  private curSheet = "";
  private curFrame = -1;
  private curFlip = true;

  constructor(
    private readonly root: HTMLElement,
    private readonly actor: HTMLElement,
  ) {
    this.walkEl = actor.querySelector<HTMLElement>("[data-sneak-walk]") ?? actor;
    this.lookEl = actor.querySelector<HTMLElement>("[data-sneak-look]") ?? actor;
  }

  start(): void {
    const { signal } = this.abort;
    void this.pickSheets();
    const queue = (): void => {
      if (!this.raf) this.raf = requestAnimationFrame(() => ((this.raf = 0), this.update()));
    };
    window.addEventListener("scroll", queue, { passive: true, signal });
    window.addEventListener("resize", () => ((this.measured = false), queue()), { passive: true, signal });
    const ro = new ResizeObserver(() => ((this.measured = false), queue()));
    ro.observe(this.root);
    signal.addEventListener("abort", () => ro.disconnect());
    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      this.measured = false;
      queue();
    });
    queue();
  }

  destroy(): void {
    this.abort.abort();
    cancelAnimationFrame(this.raf);
  }

  /** The silhouette sheets (the lit `_shaded` renders show the stock model's armour, so they are off until a proper character exists). Set SHADED to prefer them again. */
  private async pickSheets(): Promise<void> {
    const probe = (url: string): Promise<boolean> =>
      new Promise((res) => {
        const im = new Image();
        im.onload = () => res(true);
        im.onerror = () => res(false);
        im.src = url;
      });
    for (const [key, el] of [["walk", this.walkEl], ["look", this.lookEl]] as const) {
      const base = SHEETS[key];
      const url = SHADED && (await probe(`${base}_shaded.webp`)) ? `${base}_shaded.webp` : `${base}.webp`;
      if (!this.abort.signal.aborted) el.style.backgroundImage = `url(${url})`;
    }
  }

  private measure(): boolean {
    const svg = this.root.querySelector<SVGSVGElement>("svg.curved-loop__svg");
    const path = svg?.querySelector<SVGPathElement>("path[id^='cl-']");
    if (!svg || !path) return false;
    const vw = svg.viewBox.baseVal.width;
    this.width = this.root.clientWidth;
    if (!vw || !this.width) return false;
    this.scale = this.width / vw;
    this.svgTop = svg.getBoundingClientRect().top - this.root.getBoundingClientRect().top;
    const len = path.getTotalLength();
    for (let i = 0; i < SAMPLES; i++) {
      const l = (len * i) / (SAMPLES - 1);
      const p = path.getPointAtLength(l);
      const a = path.getPointAtLength(Math.max(0, l - 2));
      const b = path.getPointAtLength(Math.min(len, l + 2));
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      // stand on the lettering: move up the path's normal by the cap height
      this.xs[i] = (p.x + Math.sin(ang) * CAP_HEIGHT) * this.scale;
      this.ys[i] = this.svgTop + (p.y - Math.cos(ang) * CAP_HEIGHT) * this.scale;
      this.as[i] = ang;
    }
    // sprite size: ~2.2 x the lettering height for the figure itself (the figure is ~0.84 of the frame)
    this.size = Math.round(clamp((2.2 * CAP_HEIGHT * this.scale) / 0.84, 132, 300));
    const s = this.size;
    this.actor.style.width = this.actor.style.height = `${s}px`;
    for (const el of [this.walkEl, this.lookEl]) {
      el.style.backgroundSize = `${4 * s}px ${(el === this.walkEl ? 3 : 2) * s}px`;
    }
    this.walkPos = bgPositions(WALK_FRAMES, WALK_COLS, s);
    this.lookPos = bgPositions(LOOK_FRAMES, LOOK_COLS, s);
    this.curFrame = -1;
    this.measured = true;
    return true;
  }

  /** Foot point and tilt at screen x (binary search over the monotonic table). */
  private sample(x: number, out: [number, number, number]): void {
    let lo = 0;
    let hi = SAMPLES - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if ((this.xs[mid] ?? 0) <= x) lo = mid;
      else hi = mid;
    }
    const x0 = this.xs[lo] ?? 0;
    const x1 = this.xs[hi] ?? 0;
    const t = x1 === x0 ? 0 : clamp((x - x0) / (x1 - x0), 0, 1);
    out[0] = x;
    out[1] = (this.ys[lo] ?? 0) + ((this.ys[hi] ?? 0) - (this.ys[lo] ?? 0)) * t;
    out[2] = clamp((this.as[lo] ?? 0) + ((this.as[hi] ?? 0) - (this.as[lo] ?? 0)) * t, -MAX_TILT, MAX_TILT);
  }

  private readonly foot: [number, number, number] = [0, 0, 0];

  /** Pure function of the section's position in the viewport. Public so it can be driven directly. */
  update(): void {
    if (!this.measured && !this.measure()) return;
    const r = this.root.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = (vh - r.top) / (vh + r.height);
    const s = (p - S0) / (S1 - S0);
    const on = s > 0 && s < 1;
    if (on !== this.shown) {
      this.shown = on;
      this.actor.style.visibility = on ? "visible" : "hidden";
    }
    if (!on) return;

    // scroll -> walked fraction u in [0,1], with the two glance holds
    const walkShare = 1 - BEATS.length * BEAT_LEN;
    let u = 0;
    let beat = -1; // progress through a glance hold, or -1 when walking
    let rest = s;
    let prevU = 0;
    let done = false;
    for (let i = 0; i < BEATS.length && !done; i++) {
      const at = BEATS[i] ?? 1;
      const seg = (at - prevU) * walkShare;
      if (rest < seg) {
        u = prevU + rest / walkShare;
        done = true;
      } else {
        rest -= seg;
        if (rest < BEAT_LEN) {
          u = at;
          beat = rest / BEAT_LEN;
          done = true;
        } else {
          rest -= BEAT_LEN;
          prevU = at;
        }
      }
    }
    if (!done) u = prevU + rest / walkShare;
    u = clamp(u, 0, 1);

    const sz = this.size;
    const startX = this.width + sz * 0.5;
    const endX = -sz * 0.5;
    const x = startX + (endX - startX) * u;
    this.sample(x, this.foot);
    const footPx = (FOOT_Y / FRAME) * sz;
    this.actor.style.transform = `translate3d(${(this.foot[0] - sz / 2).toFixed(1)}px,${(this.foot[1] - footPx).toFixed(1)}px,0) rotate(${this.foot[2].toFixed(4)}rad)`;
    this.actor.style.transformOrigin = `${sz / 2}px ${footPx}px`;

    let sheet: string;
    let frame: number;
    let flip = true; // sheets face screen-right; he walks left
    if (beat < 0) {
      sheet = "walk";
      const cycles = (startX - x) / ((PX_PER_CYCLE / FRAME) * sz);
      frame = Math.floor((cycles - Math.floor(cycles)) * WALK_FRAMES) % WALK_FRAMES;
    } else {
      sheet = "look";
      // turn the head back toward screen-right and return: 0 -> 7 -> 0, facing left at the ends
      const tri = 1 - Math.abs(beat * 2 - 1);
      frame = clamp(Math.round(tri * 1.6 * (LOOK_FRAMES - 1)), 0, LOOK_FRAMES - 1);
      flip = beat < 0.2 || beat > 0.8;
    }
    if (sheet !== this.curSheet || frame !== this.curFrame || flip !== this.curFlip) {
      this.curSheet = sheet;
      this.curFrame = frame;
      this.curFlip = flip;
      const walking = sheet === "walk";
      this.walkEl.style.display = walking ? "block" : "none";
      this.lookEl.style.display = walking ? "none" : "block";
      const el = walking ? this.walkEl : this.lookEl;
      el.style.backgroundPosition = (walking ? this.walkPos : this.lookPos)[frame] ?? "0 0";
      el.style.transform = flip ? "scaleX(-1)" : "none";
    }
  }
}
