/**
 * Jesse at the workshop gallery: the same man, continuing his journey after he leaves the ribbon on the left.
 *
 * He reappears at the top-left of the pinned gallery stage, abseils down the left edge (feet against an implied wall, controlled drops, the rope drawn from above the
 * screen to his top hand), lands on the bottom edge of the film strip, then walks RIGHT along it and off the right edge of the screen.
 * Everything is a pure function of the gallery's own pin progress `t` (0 = the stage has just pinned, 1 = the strip has finished sliding):
 *   0 .. abseilEnd  : abseil (y strictly non-decreasing with t);   abseilEnd .. 1 : walk (x strictly non-decreasing, off the right edge at t = 1).
 * The hand-off state (lib/hero/handoff.ts) guarantees one figure at a time: this actor draws only while it is the owner.
 * Sheets: abseil.json (facing the wall on its RIGHT in-sheet, so it is mirrored to put the wall on the left), walk.json (faces right, unmirrored).
 */
import { getJesseSize, onJesseOwner, setJesseStatus } from "./hero/handoff";
import { parseSheet, type RibbonSheet } from "./ribbon-sneak";

const FRAME = 320;
const FOOT_Y = 293.4;

/** Tunables. */
export const GALLERY_ABSEIL = {
  /** Share of the gallery's pin progress used by the abseil; the walk gets the rest. */
  abseilEnd: 0.25,
  /** Screen x of the wall (his feet), CSS px from the stage's left edge. */
  wallInset: 8,
  /** At t = 0 the figure hangs this far above where it will end up: sprite px above the stage top of his feet, so he drops into view. */
  startAbove: 150,
  /** Sag of the rope (CSS px sideways at mid-length) and its stroke. */
  ropeSag: 5,
  ropeWidth: 1.5,
  ropeColor: "#d9c49a",
  /** Figure size (CSS px per 320 sprite frame) as a share of the stage height, clamped. */
  sizeShare: 0.3,
  sizeMin: 150,
  sizeMax: 260,
  sheets: { abseil: "/assets/runner/abseil", walk: "/assets/runner/walk" },
} as const;

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

export interface AbseilSheet extends RibbonSheet {
  dropPx: number;
  /** Cumulative drop within a cycle per frame, sprite px. */
  dropAt: Float32Array;
  /** Top-hand point per frame, sprite px (x, y interleaved). */
  hands: Float32Array;
  wallX: number;
  /** Where his feet are in the last frame (sprite y), used to land them on the strip's bottom edge. */
  feetEndY: number;
}

export interface AbseilIn {
  /** Gallery pin progress, UNCLAMPED: < 0 before the pin, > 1 after. */
  t: number;
  sz: number;
  /** Stage width and the y (stage coordinates) of the bottom edge of the film strip. */
  width: number;
  yBottom: number;
  abseil: AbseilSheet;
  walk: RibbonSheet;
}

export interface AbseilOut {
  /** idle = before the pin, active = drawn, spent = he has walked off the right edge. */
  status: "idle" | "active" | "spent";
  sheet: "abseil" | "walk";
  frame: number;
  /** Anchor x on the sheet (sprite px), and the screen position of that anchor's x and of sprite y = FOOT_Y (stage coords, CSS px). */
  hipsA: number;
  x: number;
  y: number;
  mirrored: boolean;
  rope: boolean;
  /** Rope: fixed top point (above the stage) and the hand point. */
  ropeX0: number;
  ropeY0: number;
  ropeX1: number;
  ropeY1: number;
}

export const newAbseilOut = (): AbseilOut => ({ status: "idle", sheet: "abseil", frame: 0, hipsA: 0, x: 0, y: 0, mirrored: true, rope: false, ropeX0: 0, ropeY0: 0, ropeX1: 0, ropeY1: 0 });

/** The whole gallery-figure scene for one pin progress. Pure (writes `out`, allocates nothing). */
export function abseilScene(inp: AbseilIn, out: AbseilOut): void {
  const cfg = GALLERY_ABSEIL;
  const { t, sz, width, yBottom, abseil: ab, walk } = inp;
  const k = sz / FRAME;
  out.rope = false;
  if (t <= 0 || sz <= 0) {
    out.status = "idle";
    return;
  }
  if (t >= 1) {
    out.status = "spent";
    return;
  }
  out.status = "active";
  const wallScreen = cfg.wallInset;
  const tEnd = cfg.abseilEnd;
  if (t < tEnd) {
    const a = t / tEnd;
    // vertical travel of the sprite box: from `startAbove` above the stage top (feet at wall level) to the feet on the strip's bottom edge
    const feetK = ab.feetEndY * k;
    const ty0 = -cfg.startAbove * k - feetK;
    const tyEnd = yBottom - feetK;
    const drop = Math.max(0, tyEnd - ty0);
    const cycles = Math.max(1, Math.ceil(drop / (Math.max(1, ab.dropPx) * k)));
    const phase = a * cycles;
    const whole = Math.min(cycles - 1, Math.floor(phase));
    const frame = Math.min(ab.frames - 1, Math.floor((phase - whole) * ab.frames));
    const ty = ty0 + (whole + Math.min(1, (ab.dropAt[frame] ?? 0) / Math.max(1, ab.dropPx))) * (drop / cycles);
    out.sheet = "abseil";
    out.frame = frame;
    out.hipsA = ab.wallX;
    out.mirrored = true;
    out.x = wallScreen;
    out.y = ty + FOOT_Y * k;
    // rope: from above the stage to his top hand (mirrored about the wall)
    const hx = ab.hands[frame * 2] ?? 0;
    const hy = ab.hands[frame * 2 + 1] ?? 0;
    out.rope = true;
    out.ropeX1 = wallScreen + (ab.wallX - hx) * k;
    out.ropeY1 = ty + hy * k;
    out.ropeX0 = wallScreen + (ab.wallX - (ab.hands[0] ?? hx)) * k;
    out.ropeY0 = Math.min(-24, out.ropeY1 - 40); // always from above the top of the screen
    return;
  }
  // walk: along the bottom edge, left to right, one gait cycle per pxPerCycle of ground (feet do not slide), off the right edge at t = 1
  const w = (t - tEnd) / (1 - tEnd);
  const x0 = wallScreen + (ab.wallX - (ab.hips?.[ab.frames - 1] ?? ab.hipsX)) * k;
  const x1 = width + sz * 0.6;
  const dist = Math.max(1, x1 - x0);
  const step = Math.max(1, walk.stepPx) * k;
  const phase = (w * dist) / step;
  const frame = Math.min(walk.frames - 1, Math.floor((phase - Math.floor(phase)) * walk.frames));
  out.sheet = "walk";
  out.frame = frame;
  out.hipsA = walk.hips?.[frame] ?? walk.hipsX;
  out.mirrored = false;
  out.x = x0 + w * dist;
  out.y = yBottom;
}

// ------------------------------------------------------------------ sheets + DOM

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Parse abseil.json into an AbseilSheet, or null when unusable. Pure. */
export function parseAbseil(meta: unknown): AbseilSheet | null {
  const base = parseSheet(meta, "travelPx");
  if (!base || !isObj(meta)) return null;
  const { frames } = base;
  const dropPx = num(meta["dropPx"]);
  const wallX = num(meta["wallX"]);
  const dropRaw = meta["dropAt"];
  const handsRaw = meta["hands"];
  const feetRaw = meta["feet"];
  if (dropPx === null || dropPx <= 0 || wallX === null || !Array.isArray(dropRaw) || dropRaw.length !== frames || !Array.isArray(handsRaw) || handsRaw.length !== frames) return null;
  const dropAt = new Float32Array(frames);
  const hands = new Float32Array(frames * 2);
  for (let i = 0; i < frames; i++) {
    const d: unknown = dropRaw[i];
    const h: unknown = handsRaw[i];
    const dn = num(d);
    const hx = isObj(h) ? num(h["x"]) : null;
    const hy = isObj(h) ? num(h["y"]) : null;
    if (dn === null || hx === null || hy === null) return null;
    dropAt[i] = dn;
    hands[i * 2] = hx;
    hands[i * 2 + 1] = hy;
  }
  let feetEndY = 161;
  if (Array.isArray(feetRaw) && feetRaw.length === frames) {
    const f: unknown = feetRaw[frames - 1];
    const fy = isObj(f) ? num(f["y"]) : null;
    if (fy !== null) feetEndY = fy;
  }
  return { ...base, dropPx, dropAt, hands, wallX, feetEndY };
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Mounts the figure in the gallery's pinned stage (clipped, so nothing overflows sideways) and draws `abseilScene`. The gallery calls `measure()` when it measures
 * and `update(t)` from its own frame with the raw pin progress. Sheets are optional: without them nothing is drawn (and Jesse is never claimed).
 */
export class GalleryAbseil {
  private readonly clip = document.createElement("div");
  private readonly actor = document.createElement("div");
  private readonly sheetEl = document.createElement("div");
  private readonly svg = document.createElementNS(SVG_NS, "svg");
  private readonly path = document.createElementNS(SVG_NS, "path");
  private readonly abort = new AbortController();
  private ab: AbseilSheet | null = null;
  private walk: RibbonSheet | null = null;
  private walkImg = false;
  private abImg = false;
  private sz = 0;
  private width = 0;
  private yBottom = 0;
  private shown = false;
  private lastKey = "";
  private lastTf = "";
  private lastD = "";
  private lastSheet: "abseil" | "walk" | "" = "";
  private lastT = 0;
  private readonly scene = newAbseilOut();
  private readonly abPos: string[] = [];
  private readonly walkPos: string[] = [];

  constructor(
    private readonly stage: HTMLElement,
    private readonly strip: HTMLElement,
  ) {
    const c = this.clip;
    c.className = "pg-abseil";
    c.setAttribute("aria-hidden", "true");
    this.svg.setAttribute("class", "pg-abseil__rope");
    this.path.setAttribute("fill", "none");
    this.path.setAttribute("stroke", GALLERY_ABSEIL.ropeColor);
    this.path.setAttribute("stroke-width", String(GALLERY_ABSEIL.ropeWidth));
    this.path.setAttribute("stroke-linecap", "round");
    this.svg.appendChild(this.path);
    this.actor.className = "pg-abseil__actor";
    this.sheetEl.className = "pg-abseil__sheet";
    this.actor.appendChild(this.sheetEl);
    c.append(this.svg, this.actor);
    stage.appendChild(c);
    onJesseOwner((o) => {
      if (o !== "gallery" && this.shown) this.hide();
    }, this.abort.signal);
    void this.load();
  }

  destroy(): void {
    this.abort.abort();
    this.clip.remove();
    setJesseStatus("gallery", "idle");
  }

  private async load(): Promise<void> {
    const get = async (base: string): Promise<unknown> => {
      try {
        const res = await fetch(`${base}.json`);
        if (!res.ok) return null;
        const meta: unknown = await res.json();
        const ok = await new Promise<boolean>((done) => {
          const im = new Image();
          im.onload = () => done(true);
          im.onerror = () => done(false);
          im.src = `${base}.webp`;
        });
        return ok ? meta : null;
      } catch {
        return null;
      }
    };
    const [a, w] = await Promise.all([get(GALLERY_ABSEIL.sheets.abseil), get(GALLERY_ABSEIL.sheets.walk)]);
    if (this.abort.signal.aborted) return;
    this.ab = a ? parseAbseil(a) : null;
    this.walk = w ? parseSheet(w, "pxPerCycle") : null;
    this.abImg = this.ab !== null;
    this.walkImg = this.walk !== null;
    this.layout();
    this.update(this.lastT);
  }

  /** Re-measure: stage size and the bottom edge of the film strip (stage coordinates). Call from the gallery's measure(). */
  measure(): void {
    this.width = this.stage.clientWidth;
    const vh = this.stage.clientHeight;
    this.sz = getJesseSize() || Math.round(clamp(vh * GALLERY_ABSEIL.sizeShare, GALLERY_ABSEIL.sizeMin, GALLERY_ABSEIL.sizeMax));
    // the strip's offsetParent is the gallery viewport, which fills the stage: offsetTop + height is the strip's bottom edge in stage coordinates
    this.yBottom = this.strip.offsetTop + this.strip.offsetHeight;
    this.layout();
  }

  private layout(): void {
    const sz = this.sz;
    if (!sz) return;
    this.actor.style.width = this.actor.style.height = `${sz}px`;
    this.sheetEl.style.width = this.sheetEl.style.height = `${sz}px`;
    const set = (s: RibbonSheet | null, pos: string[]): void => {
      if (!s) return;
      pos.length = 0;
      for (let i = 0; i < s.frames; i++) pos.push(`${-(i % s.cols) * sz}px ${-Math.floor(i / s.cols) * sz}px`);
    };
    set(this.ab, this.abPos);
    set(this.walk, this.walkPos);
    this.lastKey = "";
    this.lastSheet = "";
  }

  private hide(): void {
    this.shown = false;
    this.actor.style.visibility = "hidden";
    this.path.setAttribute("d", "");
    this.lastD = "";
  }

  /** `t`: the gallery's raw pin progress (< 0 before the pin, > 1 after). */
  update(t: number): void {
    this.lastT = t;
    const shared = getJesseSize();
    if (shared && shared !== this.sz) {
      this.sz = shared; // the ribbon measured after us (or resized): keep one size
      this.layout();
    }
    const ab = this.ab;
    const walk = this.walk;
    if (!ab || !walk || !this.abImg || !this.walkImg || !this.sz) return;
    const sc = this.scene;
    abseilScene({ t, sz: this.sz, width: this.width, yBottom: this.yBottom, abseil: ab, walk }, sc);
    const owner = setJesseStatus("gallery", sc.status);
    if (sc.status !== "active" || owner !== "gallery") {
      if (this.shown) this.hide();
      return;
    }
    if (!this.shown) {
      this.shown = true;
      this.actor.style.visibility = "visible";
    }
    const sz = this.sz;
    const k = sz / FRAME;
    if (sc.sheet !== this.lastSheet) {
      this.lastSheet = sc.sheet;
      const meta = sc.sheet === "abseil" ? ab : walk;
      const rows = Math.ceil(meta.frames / meta.cols);
      const url = `url(${sc.sheet === "abseil" ? GALLERY_ABSEIL.sheets.abseil : GALLERY_ABSEIL.sheets.walk}.webp)`;
      this.sheetEl.style.backgroundImage = url;
      this.sheetEl.style.backgroundSize = `${meta.cols * sz}px ${rows * sz}px`;
      this.lastKey = "";
    }
    const key = `${sc.frame}|${sc.hipsA.toFixed(1)}|${sc.mirrored ? 1 : 0}`;
    if (key !== this.lastKey) {
      this.lastKey = key;
      const pos = sc.sheet === "abseil" ? this.abPos : this.walkPos;
      this.sheetEl.style.backgroundPosition = pos[sc.frame] ?? "0 0";
      this.sheetEl.style.left = `${(sz / 2 - sc.hipsA * k).toFixed(1)}px`;
      this.sheetEl.style.transformOrigin = `${(sc.hipsA * k).toFixed(1)}px 0`;
      this.sheetEl.style.transform = sc.mirrored ? "scaleX(-1)" : "none";
    }
    const footPx = (FOOT_Y / FRAME) * sz;
    const tf = `translate3d(${(sc.x - sz / 2).toFixed(1)}px,${(sc.y - footPx).toFixed(1)}px,0)`;
    if (tf !== this.lastTf) {
      this.lastTf = tf;
      this.actor.style.transform = tf;
    }
    if (sc.rope) {
      const mx = (sc.ropeX0 + sc.ropeX1) / 2 + GALLERY_ABSEIL.ropeSag;
      const my = (sc.ropeY0 + sc.ropeY1) / 2;
      const d = `M${sc.ropeX0.toFixed(1)} ${sc.ropeY0.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${sc.ropeX1.toFixed(1)} ${sc.ropeY1.toFixed(1)}`;
      if (d !== this.lastD) {
        this.lastD = d;
        this.path.setAttribute("d", d);
      }
    } else if (this.lastD) {
      this.lastD = "";
      this.path.setAttribute("d", "");
    }
  }
}
