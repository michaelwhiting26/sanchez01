/**
 * The runner on the curved ribbon: the SAME man who hides in the hero (never a second one).
 *
 * Everything is a pure function of scroll (`ribbonScene`):
 *  1. as the ribbon comes into view he backward-rolls from his hide spot in the hero (published by the hero engine, see lib/hero/handoff.ts) down onto the ribbon's
 *     top line; the hero's canvas runner is hidden the moment this figure appears, and shown again when it goes (scroll up: he rolls back up into hiding);
 *  2. he crosses RIGHT to LEFT throwing ONLY LEFT JABS in random combinations (single, double, triple, sometimes four), with a push-step (stepin sheet) between
 *     combos and sometimes a short guard bob before one. The whole crossing is a TIMELINE of segments (guard / jab / step) laid out in nominal "scroll px";
 *     scroll maps to (segment, frame). Combo c is a pure function of (seed, c), so scrolling back reproduces exactly the same sequence. His feet are planted
 *     during jabs and guard (x constant); he advances only during steps, by the sheet's own `travelAt` (stepPx x scale per step). Feet on the ribbon curve, tilted to it.
 * Missing sheets degrade: no roll sheet = a 250 ms fade from the hide spot to the landing; no jab/stepin sheet = the old teep gait, then the tiptoe (sneak) sheet.
 */
import { getHeroHideSpot, onJesseOwner, setJesseSize, setJesseStatus, type HeroHideSpot } from "./hero/handoff";

const FRAME = 320;
const FOOT_Y = 293.4;
/** The crouch sheet's anchor x (hips of its standing frame): the hero draws every crouch frame on it, so the roll's first frame lines up with him. */
const CROUCH_REF = 162.6;
const CAP_HEIGHT = 0.7 * 64; // Barlow Condensed caps, in the ribbon's 64px font-size units
const MAX_TILT = (12 * Math.PI) / 180;
const SAMPLES = 96;

/** Tunables. Roll: it runs while the landing foot point (on the ribbon's top line) climbs from `rollFromShare` to `rollToShare` of the viewport height. Crossing: from there to the section leaving (`crossEnd`, share of the section's scroll range). */
export const RIBBON = {
  rollFromShare: 1.0,
  rollToShare: 0.66,
  crossEnd: 0.97,
  /** Fade-in / out from the hide spot when there is no roll sheet. */
  fallbackFadeMs: 250,
  sheets: { jab: "/assets/runner/jab", stepin: "/assets/runner/stepin", guard: "/assets/runner/guard", teep: "/assets/runner/teep", roll: "/assets/runner/roll", sneak: "/assets/runner/sneak", crouch: "/assets/runner/crouch" },
  /**
   * The combat timeline. Lengths are NOMINAL scroll px (relative weights): the finished timeline is fitted to the scroll distance the section gives the crossing,
   * so he always exits exactly at `crossEnd` however tall the screen. `stepsPerPush`: stepin cycles between combos. `guardChance`: a guard bob before a combo (the first always has one).
   * Combo size odds: single / double / triple / four = `oddsSingle`, `oddsDouble`, `oddsTriple` (cumulative), the rest four.
   */
  combat: { seed: 0x5a17c3, jabPx: 44, stepPx: 40, guardPx: 44, stepsPerPush: 2, guardChance: 0.35, oddsSingle: 0.36, oddsDouble: 0.72, oddsTriple: 0.94 },
} as const;

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
const smooth = (v: number): number => {
  const c = clamp(v, 0, 1);
  return c * c * (3 - 2 * c);
};

/** A sheet as the scene needs it. `hips`: per-frame hips x in sprite px (null = constant `hipsX`). */
export interface RibbonSheet {
  frames: number;
  cols: number;
  size: number;
  hipsX: number;
  hips: Float32Array | null;
  /** Gait sheets: ground the body advances per cycle (sprite px). Roll: its total travel. */
  stepPx: number;
  /** Ground covered by frame i within one cycle / the roll (sprite px), nondecreasing; null = spread evenly. The sheets are rendered in place (camera on the hips), this is how far the body has moved. */
  travel: Float32Array | null;
}

export type Foot = [x: number, y: number, tilt: number];

export interface SceneIn {
  /** The ribbon section's top in the viewport, its height, the viewport height and the section's width (CSS px). */
  rootTop: number;
  rootH: number;
  vh: number;
  width: number;
  /** Actor frame size (CSS px per 320-px sprite frame). */
  sz: number;
  hide: HeroHideSpot | null;
  /** Foot point (root-relative y) and clamped tilt on the ribbon's top line at screen x. */
  line: (x: number, out: Foot) => void;
  gait: RibbonSheet;
  /** The jab / push-step / guard kit (and its cached timeline); null = the jab or stepin sheet is missing and the old `gait` (teep, then sneak) is used. */
  combat: CombatKit | null;
  roll: RibbonSheet | null;
  /** Fallback (no roll sheet) fade 0..1, advanced by the caller in time. */
  fade: number;
}

export interface SceneOut {
  /** The ribbon figure is drawn. */
  visible: boolean;
  /** The hero's canvas runner must not be drawn. Never true while `visible` is false EXCEPT once he has walked off the left edge (nobody on screen then). */
  heroHidden: boolean;
  sheet: "roll" | "gait" | "pose" | "jab" | "step" | "guard";
  frame: number;
  /** Hips anchor x on the sheet (sprite px), screen x of that anchor and of the feet's y (root-relative CSS px). */
  hipsA: number;
  x: number;
  y: number;
  tilt: number;
  /** Size relative to `sz`. */
  scale: number;
  mirrored: boolean;
  alpha: number;
  /** Scroll-driven roll progress 0..1 (0 = not started), crossing progress 0..1, and whether the fallback fade should be heading to 1. */
  rollT: number;
  cross: number;
  wantFade: boolean;
}

export const newScene = (): SceneOut => ({ visible: false, heroHidden: false, sheet: "gait", frame: 0, hipsA: FRAME / 2, x: 0, y: 0, tilt: 0, scale: 1, mirrored: true, alpha: 1, rollT: 0, cross: 0, wantFade: false });

const foot: Foot = [0, 0, 0];
const footLand: Foot = [0, 0, 0];

const hipsAt = (s: RibbonSheet, f: number): number => s.hips?.[clamp(Math.round(f), 0, s.frames - 1)] ?? s.hipsX;

/** The whole ribbon scene for one scroll position. Pure (writes `out`, allocates nothing). */
export function ribbonScene(inp: SceneIn, out: SceneOut): void {
  const { sz, vh, width, hide, roll, gait } = inp;
  const k = sz / FRAME;
  out.visible = false;
  out.heroHidden = false;
  out.rollT = 0;
  out.cross = 0;
  out.wantFade = false;
  out.alpha = 1;
  out.scale = 1;
  out.tilt = 0;
  if (!hide || sz <= 0 || vh <= 0) return;

  // where he lands: the roll's own travel from the hide spot (backward, so away from where he faces), else straight down
  const kh = hide.scale;
  const dir = hide.facing === "left" ? -1 : 1; // screen direction of sheet +x for the drawing (the hero mirrors when facing left)
  // (a backward roll moves against the way the sheet faces: negative sheet x)
  const rollTravel = roll ? (roll.travel?.[roll.frames - 1] ?? roll.stepPx) : 0;
  const h0 = hide.x + dir * (roll ? hipsAt(roll, 0) - CROUCH_REF : 0) * kh; // frame 0 is the crouch's last frame: exactly where the hero draws him
  const hEnd = hide.x + dir * ((roll ? hipsAt(roll, roll.frames - 1) - CROUCH_REF : 0) - rollTravel) * k;
  const xLand = clamp(hEnd, sz * 0.4, Math.max(sz * 0.4, width - sz * 0.4));
  inp.line(xLand, footLand);
  const yLandRoot = footLand[1];
  const yL = inp.rootTop + yLandRoot;
  const sRoll = clamp((RIBBON.rollFromShare * vh - yL) / ((RIBBON.rollFromShare - RIBBON.rollToShare) * vh), 0, 1);
  out.rollT = sRoll;
  out.wantFade = sRoll > 0;
  const p = (vh - inp.rootTop) / (vh + inp.rootH);
  const p1 = (vh - (RIBBON.rollToShare * vh - yLandRoot)) / (vh + inp.rootH);
  const cross = clamp((p - p1) / Math.max(0.05, RIBBON.crossEnd - p1), 0, 1);

  const rollMode = roll !== null;
  const engaged = rollMode ? sRoll > 0 : inp.fade > 0;
  out.heroHidden = engaged;
  if (!engaged) return;
  const crossing = rollMode ? sRoll >= 1 : sRoll >= 1 && inp.fade >= 1;

  if (!crossing) {
    const e = smooth(rollMode ? sRoll : inp.fade);
    const hy = hide.y - inp.rootTop;
    out.visible = true;
    out.mirrored = dir < 0;
    out.y = hy + (yLandRoot - hy) * e;
    out.scale = (kh + (k - kh) * e) / k;
    out.tilt = footLand[2] * e;
    if (rollMode && roll) {
      const f = sRoll * (roll.frames - 1);
      out.sheet = "roll";
      out.frame = Math.round(f);
      out.hipsA = hipsAt(roll, f);
      const tr = roll.travel;
      const last = tr?.[roll.frames - 1] ?? 0;
      const frac = tr && last > 0 ? (tr[out.frame] ?? 0) / last : roll.frames > 1 ? f / (roll.frames - 1) : 1;
      out.x = h0 + (xLand - h0) * frac;
      out.alpha = 1;
    } else {
      // fade from the hide spot to the landing, in the crouch's last pose
      out.sheet = "pose";
      out.frame = -1; // the caller picks the crouch's last frame (or the gait's first)
      out.hipsA = CROUCH_REF;
      out.x = hide.x + (xLand - hide.x) * e;
      out.alpha = inp.fade;
    }
    return;
  }

  if (inp.combat) {
    combatCross(inp, out, inp.combat, xLand, cross);
    return;
  }

  // scroll drives the gait phase (cycles walked), the sheet says how far the body has got at that frame: feet never slide, and he stands still while a teep is thrown
  const step = Math.max(1, gait.stepPx) * k;
  const cycles = cross * ((xLand + sz * 0.6) / step);
  const whole = Math.floor(cycles);
  out.cross = cross;
  if (cross >= 1) return; // off the left edge: nobody on screen (the hero is far above by now)
  out.frame = Math.min(gait.frames - 1, Math.floor((cycles - whole) * gait.frames));
  const within = gait.travel ? (gait.travel[out.frame] ?? 0) * k : (cycles - whole) * step;
  const x = xLand - whole * step - within;
  inp.line(x, foot);
  out.visible = true;
  out.sheet = "gait";
  out.mirrored = true;
  out.x = x;
  out.y = foot[1];
  out.tilt = foot[2];
  out.hipsA = hipsAt(gait, out.frame);
}


// ------------------------------------------------------------------ combat timeline

export const SEG_GUARD = 0;
export const SEG_JAB = 1;
export const SEG_STEP = 2;

/** Deterministic hash of (seed, combo index, salt) to [0, 1). The same inputs always give the same number, so the sequence is reproducible in either scroll direction. */
export function hash01(seed: number, c: number, salt: number): number {
  let t = (seed + Math.imul(c + 1, 0x9e3779b1) + Math.imul(salt + 1, 0x85ebca6b)) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Combo `c`: whether a guard bob comes first, and how many left jabs (1..4). Pure in (c, seed). */
export function comboAt(c: number, seed: number = RIBBON.combat.seed): { guard: boolean; jabs: number } {
  const cf = RIBBON.combat;
  const r = hash01(seed, c, 1);
  return { guard: c === 0 || hash01(seed, c, 0) < cf.guardChance, jabs: r < cf.oddsSingle ? 1 : r < cf.oddsDouble ? 2 : r < cf.oddsTriple ? 3 : 4 };
}

/** The crossing laid out as segments. `start`/`len` in nominal scroll px; `stepsBefore` = step cycles completed before the segment; `combo` = the combo it belongs to. */
export interface Timeline {
  kind: Uint8Array;
  start: Float32Array;
  len: Float32Array;
  stepsBefore: Uint16Array;
  combo: Uint16Array;
  count: number;
  total: number;
  /** Step cycles in the whole crossing (the last segment ends the last one). */
  steps: number;
}

/** Lay out combos until `steps` push-step cycles have been walked. Allocates (once per screen size), never per frame. */
export function buildTimeline(steps: number, hasGuard: boolean, seed: number = RIBBON.combat.seed): Timeline {
  const cf = RIBBON.combat;
  const kind: number[] = [];
  const len: number[] = [];
  const sb: number[] = [];
  const cb: number[] = [];
  let done = 0;
  for (let c = 0; done < steps; c++) {
    const { guard, jabs } = comboAt(c, seed);
    if (guard && hasGuard) {
      kind.push(SEG_GUARD);
      len.push(cf.guardPx);
      sb.push(done);
      cb.push(c);
    }
    for (let j = 0; j < jabs; j++) {
      kind.push(SEG_JAB);
      len.push(cf.jabPx);
      sb.push(done);
      cb.push(c);
    }
    const n = Math.min(cf.stepsPerPush, steps - done);
    for (let s = 0; s < n; s++) {
      kind.push(SEG_STEP);
      len.push(cf.stepPx);
      sb.push(done);
      cb.push(c);
      done++;
    }
  }
  const count = kind.length;
  const start = new Float32Array(count);
  let acc = 0;
  for (let i = 0; i < count; i++) {
    start[i] = acc;
    acc += len[i] ?? 0;
  }
  return { kind: Uint8Array.from(kind), start, len: Float32Array.from(len), stepsBefore: Uint16Array.from(sb), combo: Uint16Array.from(cb), count, total: acc, steps };
}

/** Index of the segment holding nominal scroll position `t` (binary search; no allocation). */
export function segmentAt(tl: Timeline, t: number): number {
  let lo = 0;
  let hi = tl.count - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((tl.start[mid] ?? 0) <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export interface CombatKit {
  jab: RibbonSheet;
  stepin: RibbonSheet;
  guard: RibbonSheet | null;
  /** Cache, rebuilt only when the number of step cycles changes (a resize). */
  tl: Timeline | null;
}

function combatCross(inp: SceneIn, out: SceneOut, kit: CombatKit, xLand: number, cross: number): void {
  const k = inp.sz / FRAME;
  const stepK = Math.max(1, kit.stepin.stepPx) * k;
  const steps = Math.max(1, Math.ceil((xLand + inp.sz * 0.6) / stepK));
  if (!kit.tl || kit.tl.steps !== steps) kit.tl = buildTimeline(steps, kit.guard !== null);
  const tl = kit.tl;
  out.cross = cross;
  if (cross >= 1) return; // off the left edge: nobody on screen
  const i = segmentAt(tl, cross * tl.total);
  const frac = clamp((cross * tl.total - (tl.start[i] ?? 0)) / Math.max(1e-6, tl.len[i] ?? 1), 0, 1);
  const kd = tl.kind[i];
  const sheet = kd === SEG_STEP ? kit.stepin : kd === SEG_GUARD && kit.guard ? kit.guard : kit.jab;
  const frame = Math.min(sheet.frames - 1, Math.floor(frac * sheet.frames));
  const adv = ((tl.stepsBefore[i] ?? 0) * kit.stepin.stepPx + (kd === SEG_STEP ? (kit.stepin.travel?.[frame] ?? frac * kit.stepin.stepPx) : 0)) * k;
  const x = xLand - adv;
  inp.line(x, foot);
  out.visible = true;
  out.sheet = kd === SEG_STEP ? "step" : kd === SEG_GUARD ? "guard" : "jab";
  out.frame = frame;
  out.mirrored = true;
  out.x = x;
  out.y = foot[1];
  out.tilt = foot[2];
  out.hipsA = hipsAt(sheet, frame);
}

// ------------------------------------------------------------------ sheets

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

function xs(v: unknown): Float32Array | null {
  if (!Array.isArray(v) || !v.length) return null;
  const a = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) {
    const e: unknown = v[i];
    const n = isObj(e) ? num(e["x"]) : num(e);
    if (n === null) return null;
    a[i] = n;
  }
  return a;
}

/** Turn a sheet's JSON into a RibbonSheet, or null when it is unusable. `stepKey`: which field holds the gait's ground per cycle. Pure. */
export function parseSheet(meta: unknown, stepKey: "stepPx" | "pxPerCycle" | "travelPx"): RibbonSheet | null {
  if (!isObj(meta)) return null;
  const frames = Math.floor(num(meta["frames"]) ?? 0);
  const cols = Math.floor(num(meta["cols"]) ?? 0);
  const size = num(meta["size"]) ?? FRAME;
  if (frames < 1 || cols < 1 || size <= 0) return null;
  const hipsRaw = meta["hips"];
  let hips = xs(hipsRaw);
  if (hips && hips.length !== frames) hips = null;
  const single = isObj(hipsRaw) ? num(hipsRaw["x"]) : null;
  const stepPx = num(meta[stepKey]) ?? 0;
  if (stepKey !== "travelPx" && stepPx <= 0) return null;
  let travel = xs(meta["travelAt"]);
  if (travel && travel.length !== frames) travel = null;
  return { frames, cols, size, hipsX: single ?? hips?.[0] ?? size / 2, hips, stepPx, travel };
}

/**
 * A gait sheet's hips with the linear drift of any baked-in travel removed: the scene advances the body `stepPx` per cycle itself,
 * so what stays is only the sheet's own periodic sway (a sheet rendered in place has no drift and is unchanged).
 */
export function detrendHips(s: RibbonSheet): RibbonSheet {
  const h = s.hips;
  if (!h || s.frames < 2) return s;
  const slope = ((h[s.frames - 1] ?? 0) - (h[0] ?? 0)) / (s.frames - 1);
  const out = new Float32Array(s.frames);
  for (let i = 0; i < s.frames; i++) out[i] = (h[i] ?? 0) - slope * i;
  return { ...s, hips: out, hipsX: out[0] ?? s.hipsX };
}

function bgPositions(s: RibbonSheet, sz: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.frames; i++) out.push(`${-(i % s.cols) * sz}px ${-Math.floor(i / s.cols) * sz}px`);
  return out;
}

interface Layer {
  el: HTMLElement;
  sheet: RibbonSheet;
  pos: string[];
  key: string;
}

/** Old tiptoe sheet constants: used only when the teep sheet is missing. */
const SNEAK_FALLBACK: RibbonSheet = { frames: 12, cols: 4, size: FRAME, hipsX: 163.1, hips: null, stepPx: 213.3, travel: null };

export class RibbonSneak {
  private readonly xs = new Float32Array(SAMPLES);
  private readonly ys = new Float32Array(SAMPLES);
  private readonly as = new Float32Array(SAMPLES);
  private readonly abort = new AbortController();
  private readonly layers: Partial<Record<"jab" | "stepin" | "guard" | "teep" | "sneak" | "roll" | "crouch", Layer>> = {};
  private kit: CombatKit | null = null;
  private size = 0;
  private scale = 1;
  private svgTop = 0;
  private width = 0;
  private measured = false;
  private raf = 0;
  private shown = false;
  private fade = 0;
  private fadeAt = 0;
  private active: Layer | null = null;
  private readonly scene = newScene();
  private lastTransform = "";
  private lastAlpha = -1;

  constructor(
    private readonly root: HTMLElement,
    private readonly actor: HTMLElement,
  ) {}

  start(): void {
    const { signal } = this.abort;
    void this.loadSheets();
    onJesseOwner((o) => {
      if (o !== "ribbon" && this.shown) {
        this.shown = false;
        this.actor.style.visibility = "hidden";
      }
    }, signal);
    const queue = (): void => {
      if (!this.raf) this.raf = requestAnimationFrame(() => ((this.raf = 0), this.update()));
    };
    this.queue = queue;
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

  private queue: () => void = () => undefined;

  destroy(): void {
    this.abort.abort();
    cancelAnimationFrame(this.raf);
    setJesseStatus("ribbon", "idle"); // the ribbon figure is gone: the hero's man may be drawn again
  }

  /** Load the sheets (each optional). The silhouette sheets only: the lit `_shaded` renders show the stock model's armour. */
  private async loadSheets(): Promise<void> {
    const load = async (name: "jab" | "stepin" | "guard" | "teep" | "sneak" | "roll" | "crouch", key: "stepPx" | "pxPerCycle" | "travelPx", detrend: boolean): Promise<void> => {
      const base = RIBBON.sheets[name];
      try {
        const res = await fetch(`${base}.json`);
        if (!res.ok) return;
        const parsed = parseSheet(await res.json(), key);
        if (!parsed) return;
        const img = await new Promise<boolean>((ok) => {
          const im = new Image();
          im.onload = () => ok(true);
          im.onerror = () => ok(false);
          im.src = `${base}.webp`;
        });
        if (!img || this.abort.signal.aborted) return;
        const el = document.createElement("div");
        el.className = "ribbon-sneak__sheet";
        el.style.inset = "0 auto auto 0";
        el.style.backgroundImage = `url(${base}.webp)`;
        el.style.display = "none";
        this.actor.appendChild(el);
        this.layers[name] = { el, sheet: detrend ? detrendHips(parsed) : parsed, pos: [], key: "" };
        this.measured = false;
        this.queue();
      } catch {
        /* missing or bad sheet: the fallback stands in */
      }
    };
    await Promise.all([load("jab", "travelPx", false), load("stepin", "stepPx", false), load("guard", "travelPx", false), load("roll", "travelPx", false), load("crouch", "travelPx", false)]);
    const { jab, stepin, guard } = this.layers;
    if (jab && stepin) this.kit = { jab: jab.sheet, stepin: stepin.sheet, guard: guard?.sheet ?? null, tl: null };
    else {
      // fallback chain: jab or stepin missing -> the teep gait -> the tiptoe sheet
      await load("teep", "stepPx", true);
      if (!this.layers.teep) await load("sneak", "pxPerCycle", false);
    }
    this.measured = false;
    this.queue();
  }

  private gaitLayer(): Layer | null {
    return this.layers.teep ?? this.layers.sneak ?? null;
  }

  private gaitSheet(): RibbonSheet {
    return this.layers.teep?.sheet ?? SNEAK_FALLBACK;
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
    setJesseSize(this.size);
    const s = this.size;
    this.actor.style.width = this.actor.style.height = `${s}px`;
    for (const l of Object.values(this.layers)) {
      const rows = Math.ceil(l.sheet.frames / l.sheet.cols);
      l.el.style.width = l.el.style.height = `${s}px`;
      l.el.style.backgroundSize = `${l.sheet.cols * s}px ${rows * s}px`;
      l.pos = bgPositions(l.sheet, s);
      l.key = "";
    }
    this.measured = true;
    return true;
  }

  /** Foot point and tilt at screen x (binary search over the monotonic table). */
  private readonly sampleLine = (x: number, out: Foot): void => {
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
  };

  /** Pure function of the section's position in the viewport. Public so it can be driven directly (`view` fakes the scroll position: the section's top and the viewport height). */
  update(view?: { rootTop: number; vh: number }): void {
    if (!this.measured && !this.measure()) return;
    const hide = getHeroHideSpot();
    const rect = this.root.getBoundingClientRect();
    const rootTop = view?.rootTop ?? rect.top;
    const vh = view?.vh ?? window.innerHeight;
    const gaitLayer = this.gaitLayer();
    const kit = this.kit;
    const rollSheet = this.layers.roll?.sheet ?? null;
    const sz = this.size;
    const inp: SceneIn = { rootTop, rootH: rect.height || sz * 3, vh, width: this.width, sz, hide: kit || gaitLayer ? hide : null, line: this.sampleLine, gait: this.gaitSheet(), combat: kit, roll: rollSheet, fade: this.fade };
    if (rect.left !== 0 && inp.hide) inp.hide = { ...inp.hide, x: inp.hide.x - rect.left };
    const sc = this.scene;
    ribbonScene(inp, sc);
    if (!rollSheet) {
      // no roll sheet: the fade from the hide spot runs on the clock, not the scroll
      const now = performance.now();
      const dt = this.fadeAt ? now - this.fadeAt : 0;
      this.fadeAt = now;
      const target = sc.wantFade ? 1 : 0;
      const step = dt / RIBBON.fallbackFadeMs;
      const next = this.fade < target ? Math.min(target, this.fade + step) : Math.max(target, this.fade - step);
      if (next !== this.fade) {
        this.fade = next;
        inp.fade = next;
        ribbonScene(inp, sc);
        this.queue();
      } else this.fadeAt = 0;
    }
    // one man: the canvas runner goes the moment this one is drawn, and comes back when this one is gone
    // (hand-off state: hero | ribbon | gallery | none; the ribbon is drawn only while it is the owner)
    const owner = setJesseStatus("ribbon", sc.visible ? "active" : sc.heroHidden ? "spent" : "idle");
    const draw = sc.visible && owner === "ribbon";
    if (draw !== this.shown) {
      this.shown = draw;
      this.actor.style.visibility = draw ? "visible" : "hidden";
    }
    if (!draw) return;
    this.apply(sc);
  }

  private apply(sc: SceneOut): void {
    const sz = this.size;
    const k = sz / FRAME;
    const layer =
      sc.sheet === "roll" ? this.layers.roll : sc.sheet === "gait" ? this.gaitLayer() : sc.sheet === "jab" ? this.layers.jab : sc.sheet === "step" ? this.layers.stepin : sc.sheet === "guard" ? this.layers.guard : (this.layers.crouch ?? this.layers.jab ?? this.gaitLayer());
    if (!layer) return;
    let frame = sc.frame;
    let hipsA = sc.hipsA;
    if (sc.sheet === "pose") {
      if (layer === this.layers.crouch) frame = layer.sheet.frames - 1;
      else {
        frame = 0;
        hipsA = hipsAt(layer.sheet, 0);
      }
    }
    if (layer !== this.active) {
      if (this.active) this.active.el.style.display = "none";
      layer.el.style.display = "block";
      this.active = layer;
    }
    const key = `${frame}|${hipsA.toFixed(1)}|${sc.mirrored ? 1 : 0}`;
    if (key !== layer.key) {
      layer.key = key;
      layer.el.style.backgroundPosition = layer.pos[clamp(frame, 0, layer.sheet.frames - 1)] ?? "0 0";
      layer.el.style.left = `${(sz / 2 - hipsA * k).toFixed(1)}px`;
      layer.el.style.transformOrigin = `${(hipsA * k).toFixed(1)}px 0`;
      layer.el.style.transform = sc.mirrored ? "scaleX(-1)" : "none";
    }
    const footPx = (FOOT_Y / FRAME) * sz;
    const tf = `translate3d(${(sc.x - sz / 2).toFixed(1)}px,${(sc.y - footPx).toFixed(1)}px,0) rotate(${sc.tilt.toFixed(4)}rad) scale(${sc.scale.toFixed(4)})`;
    if (tf !== this.lastTransform) {
      this.lastTransform = tf;
      this.actor.style.transform = tf;
      this.actor.style.transformOrigin = `${sz / 2}px ${footPx}px`;
    }
    if (sc.alpha !== this.lastAlpha) {
      this.lastAlpha = sc.alpha;
      this.actor.style.opacity = sc.alpha.toFixed(3);
    }
  }
}
