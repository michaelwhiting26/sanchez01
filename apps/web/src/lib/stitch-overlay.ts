/**
 * Running-stitch thread on a feature card, ONLY while someone is hovering or touching it (a card at rest is clean).
 * Long soft lines of hairline gold running stitch flow across the card, drifting softly on their own; the pointer or finger is a real focal point:
 * the thread bends round it, ripples when it moves, and glows near it. Sewn in outward from the point of contact (ease-out), cut off fast on exit.
 * One WebGL quad and one fragment shader per card. The loop runs only while the overlay is visible. Reduced motion: no wave, no drift.
 */
import { STITCH_FRAGMENT, STITCH_VERTEX } from "./stitch-shader";

export const STITCH_CONFIG = {
  spacing: 5.4, // css px between lines
  dash: 4.6,
  gap: 2.4, // css px: running stitch
  thickness: 0.9, // css px: hairline thread
  missing: 0.11, // share of stitches left out
  feather: 0.14,
  roughness: 0.34,
  activateMs: 800,
  deactivateMs: 300,
  deactivateTouchMs: 520,
  shimmer: 0.07,
  breathe: 0.035,
  drift: 12, // gentle life: how fast the lines breathe and the stitches travel
  lens: 1.7,
  swirl: 0.07,
  sigma: 96, // the pointer's pull on the thread
  warp: 1.0,
  origin: [0.5, 0.47] as const, // where the print sits when nothing has touched the card
} as const;

const UNIFORMS = [
  "uSize", "uOrigin", "uFocus", "uEnergy", "uBreathe", "uDrift", "uLens", "uSwirl", "uSigma", "uReveal", "uPower", "uTime", "uSeed",
  "uSpacing", "uDash", "uGap", "uThick", "uMissing", "uFeather", "uRough", "uShimmer", "uWarp",
] as const;
type UniformName = (typeof UNIFORMS)[number];

const easeOutQuart = (t: number): number => 1 - (1 - t) ** 4;

export class StitchOverlay {
  private readonly gl: WebGLRenderingContext;
  private readonly u = new Map<UniformName, WebGLUniformLocation>();
  private readonly abort = new AbortController();
  private readonly reduce: boolean;
  private readonly seed: number;
  private readonly t0 = performance.now();
  private w = 0;
  private h = 0;
  private target = 0;
  private reveal = 0;
  private power = 0;
  private tAct = 0;
  private tOff = 0;
  private pOff = 0;
  private fx = 0;
  private fy = 0;
  private sx = 0;
  private sy = 0;
  private lx = 0;
  private ly = 0;
  private lt = 0;
  private energy = 0;
  private isTouch = false;
  private raf = 0;
  private lastNow = performance.now();

  private constructor(
    private readonly card: HTMLElement,
    private readonly canvas: HTMLCanvasElement,
    gl: WebGLRenderingContext,
    reduce: boolean,
    index: number,
  ) {
    this.gl = gl;
    this.reduce = reduce;
    this.seed = index * 1.618 + 0.37;
  }

  /** Returns null when WebGL is unavailable (the card simply has no overlay). */
  static attach(card: HTMLElement, canvas: HTMLCanvasElement, index: number): StitchOverlay | null {
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return null;
    const compile = (type: number, src: string): WebGLShader | null => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, STITCH_VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, STITCH_FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const overlay = new StitchOverlay(card, canvas, gl, window.matchMedia("(prefers-reduced-motion: reduce)").matches, index);
    for (const name of UNIFORMS) {
      const l = gl.getUniformLocation(program, name);
      if (l) overlay.u.set(name, l);
    }
    overlay.bind();
    return overlay;
  }

  destroy(): void {
    this.abort.abort();
    cancelAnimationFrame(this.raf);
  }

  private uni(name: UniformName): WebGLUniformLocation | null {
    return this.u.get(name) ?? null;
  }

  private size = (): void => {
    const w = this.card.offsetWidth;
    const h = this.card.offsetHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    if (!this.fx) {
      this.fx = this.sx = w * STITCH_CONFIG.origin[0];
      this.fy = this.sy = h * STITCH_CONFIG.origin[1];
    }
  };

  /** The pointer or finger is the focal point (css px inside the card). */
  private focus(e: PointerEvent, jump: boolean): void {
    const r = this.card.getBoundingClientRect();
    const x = Math.max(0, Math.min(r.width, e.clientX - r.left));
    const y = Math.max(0, Math.min(r.height, e.clientY - r.top));
    const now = performance.now();
    if (jump) {
      this.sx = this.lx = x;
      this.sy = this.ly = y;
      this.lt = now;
      this.energy = 0;
    } else {
      const dt = Math.max(8, now - this.lt);
      const speed = Math.hypot(x - this.lx, y - this.ly) / dt;
      this.energy = Math.min(1, this.energy + speed * 0.35); // speed of movement feeds the ripples
      this.lx = x;
      this.ly = y;
      this.lt = now;
    }
    this.fx = x;
    this.fy = y;
  }

  private activate(): void {
    const now = performance.now();
    this.target = 1;
    if (this.power < 0.02 || this.reduce) {
      this.reveal = this.reduce ? 1 : 0;
      this.tAct = now;
    } else {
      this.tAct = now - (1 - (1 - Math.min(1, this.reveal)) ** 0.25) * STITCH_CONFIG.activateMs; // resume the wave from where it is
    }
    this.kick();
  }

  private deactivate(): void {
    this.target = 0;
    this.tOff = performance.now();
    this.pOff = this.power;
    this.kick();
  }

  private kick(): void {
    if (!this.raf) {
      this.lastNow = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    }
  }

  private bind(): void {
    const { signal } = this.abort;
    const c = this.card;
    this.size();
    const ro = new ResizeObserver(this.size);
    ro.observe(c);
    signal.addEventListener("abort", () => ro.disconnect());
    // the pattern exists only while there is interaction: hover with a mouse, or a finger down on the card
    const enter = (e: PointerEvent): void => {
      this.isTouch = e.pointerType === "touch";
      this.focus(e, true);
      this.activate();
    };
    c.addEventListener("pointerenter", enter, { signal });
    c.addEventListener("pointerdown", enter, { signal });
    c.addEventListener("pointermove", (e) => this.target > 0 && this.focus(e, false), { signal });
    for (const name of ["pointerleave", "pointerup", "pointercancel"] as const) c.addEventListener(name, () => this.deactivate(), { signal });
    c.addEventListener(
      "focus",
      () => {
        this.isTouch = false;
        this.fx = this.sx = this.w * STITCH_CONFIG.origin[0];
        this.fy = this.sy = this.h * STITCH_CONFIG.origin[1];
        this.activate();
      },
      { signal },
    );
    c.addEventListener("blur", () => this.deactivate(), { signal });
  }

  /** ACTIVATE = the wave sews the stitches in (ease-out radius); DEACTIVATE = the thread just goes out fast (the wave is not reversed). */
  private step(now: number): void {
    const dt = Math.min(0.05, Math.max(0.001, (now - this.lastNow) / 1000));
    this.sx += (this.fx - this.sx) * (1 - Math.exp(-dt * 9)); // the print follows the pointer with a soft lag
    this.sy += (this.fy - this.sy) * (1 - Math.exp(-dt * 9));
    this.energy *= Math.exp(-dt * 2.6); // ripples die away
    if (this.target > 0) {
      const t = this.reduce ? 1 : Math.min(1, (now - this.tAct) / STITCH_CONFIG.activateMs);
      this.reveal = this.reduce ? 1 : easeOutQuart(t);
      this.power = Math.min(1, this.power + 0.12 + (this.reduce ? 1 : 0));
    } else if (this.power > 0) {
      const ms = this.isTouch ? STITCH_CONFIG.deactivateTouchMs : STITCH_CONFIG.deactivateMs;
      this.power = Math.max(0, this.pOff * (1 - (now - this.tOff) / ms));
      if (this.power === 0) this.reveal = 0;
    }
  }

  private render(t: number): void {
    const { gl } = this;
    const C = STITCH_CONFIG;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (this.power <= 0.001) return;
    const set1 = (n: UniformName, v: number): void => gl.uniform1f(this.uni(n), v);
    gl.uniform2f(this.uni("uSize"), this.w, this.h);
    gl.uniform2f(this.uni("uOrigin"), this.sx / this.w, this.sy / this.h);
    gl.uniform2f(this.uni("uFocus"), this.sx, this.sy);
    set1("uEnergy", this.energy);
    set1("uBreathe", this.reduce ? 0 : C.breathe);
    set1("uDrift", this.reduce ? 0 : C.drift);
    set1("uLens", C.lens);
    set1("uSwirl", C.swirl);
    set1("uSigma", C.sigma);
    set1("uReveal", this.reveal);
    set1("uPower", this.power);
    set1("uTime", t);
    set1("uSeed", this.seed);
    set1("uSpacing", C.spacing);
    set1("uDash", C.dash);
    set1("uGap", C.gap);
    set1("uThick", C.thickness);
    set1("uMissing", C.missing);
    set1("uFeather", C.feather);
    set1("uRough", C.roughness);
    set1("uShimmer", this.reduce ? 0 : C.shimmer);
    set1("uWarp", C.warp);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private readonly loop = (now: number): void => {
    this.raf = 0;
    if (document.hidden) return;
    this.step(now);
    this.render((now - this.t0) / 1000);
    this.lastNow = now;
    if (this.power > 0 || this.target > 0) this.raf = requestAnimationFrame(this.loop); // stops when the thread has gone out
    else this.render(0); // clear the last frame
  };
}
