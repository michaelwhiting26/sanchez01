/**
 * Curved text loop: words flow along an arc; drag to push it faster or reverse it.
 *
 * Layout is arithmetic on word widths only. Each word is its own <text><textPath> placed by startOffset; each star sits in a fixed-width slot between
 * words. Word widths are measured one word at a time (every browser agrees on that); runs of spaces and per-character position queries are avoided
 * because iOS Safari answers them differently from how it draws them. The star sprite is finished in SVG: oxblood colour matrix, a thin champagne rim,
 * a soft warm shadow, and a glint clipped to the sprite's own alpha that sweeps across it as it travels.
 */
const NS = "http://www.w3.org/2000/svg";
const FONT_SIZE = 64;
const STAR_SIZE = 60;
const SLOT = STAR_SIZE + 2 * 0.55 * FONT_SIZE;

interface WordItem {
  kind: "word";
  text: string;
  x: number;
  width: number;
}
interface StarItem {
  kind: "star";
  centre: number;
}
type LayoutItem = WordItem | StarItem;

interface PlacedWord {
  el: SVGTextElement;
  path: SVGTextPathElement;
  x: number;
  width: number;
}
interface PlacedStar {
  d0: number;
  group: SVGGElement;
  glint: SVGRectElement;
}

export interface CurvedLoopOptions {
  root: HTMLElement;
  /** Words separated by ✦ (the star). */
  text: string;
  curve: number;
  speed: number;
  starSrc: string;
  reducedMotion: boolean;
}

function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>, parent?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  parent?.appendChild(e);
  return e;
}

export class CurvedLoop {
  private readonly root: HTMLElement;
  private readonly svg: SVGSVGElement;
  private readonly path: SVGPathElement;
  private readonly measure: SVGTextElement;
  private readonly abort = new AbortController();
  private readonly pieces: string[];
  private readonly vw: number;
  private readonly speed: number;
  private readonly reduce: boolean;
  private readonly id = `cl-${Math.random().toString(36).slice(2, 8)}`;
  private readonly sprite: string;

  private items: LayoutItem[] = [];
  private words: PlacedWord[] = [];
  private stars: PlacedStar[] = [];
  private spacing = 0;
  private offset = 0;
  private dir: 1 | -1 = -1;
  private vel = 0;
  private dragging = false;
  private lastX = 0;
  private plen = 0;
  private visible = true;
  private raf = 0;
  private last = performance.now();

  constructor(o: CurvedLoopOptions) {
    this.root = o.root;
    this.reduce = o.reducedMotion;
    this.sprite = o.starSrc;
    this.pieces = o.text.split("✦").map((p) => p.trim());
    this.vw = (o.root.clientWidth || window.innerWidth) < 700 ? 640 : 1440; // a narrower drawing on phones keeps the letters large
    const curve = o.curve * (this.vw < 1440 ? 0.6 : 1);
    this.speed = o.speed;

    this.svg = el("svg", { viewBox: `0 0 ${this.vw} ${70 + curve / 2}`, class: "curved-loop__svg", "aria-hidden": "true" });
    this.path = el("path", { id: this.id, d: `M-100,50 Q${this.vw / 2},${50 + curve} ${this.vw + 100},50`, fill: "none" });
    this.measure = el("text", { class: "curved-loop__text" });
    this.measure.style.visibility = "hidden";
    const defs = el("defs", {});
    defs.appendChild(this.path);
    this.svg.appendChild(this.measure);
    this.svg.appendChild(defs);
    this.buildStarDefs(defs);
    this.root.appendChild(this.svg);
    this.root.setAttribute("aria-label", o.text.replace(/✦/g, "").replace(/\s+/g, " ").trim() || "Sanchez");
  }

  start(): void {
    const { signal } = this.abort;
    const io = new IntersectionObserver((e) => (this.visible = e[0]?.isIntersecting ?? true), { rootMargin: "150px" });
    io.observe(this.root);
    signal.addEventListener("abort", () => io.disconnect());
    this.root.addEventListener(
      "pointerdown",
      (e) => {
        this.dragging = true;
        this.lastX = e.clientX;
        this.vel = 0;
        this.root.setPointerCapture(e.pointerId);
      },
      { signal },
    );
    this.root.addEventListener(
      "pointermove",
      (e) => {
        if (!this.dragging) return;
        const dx = e.clientX - this.lastX;
        this.lastX = e.clientX;
        this.offset += dx * (this.vw / this.root.clientWidth);
        this.vel = dx;
        this.wrap();
        this.moveWords();
        this.place();
      },
      { signal },
    );
    const end = (): void => {
      if (!this.dragging) return;
      this.dragging = false;
      if (Math.abs(this.vel) > 0.5) this.dir = this.vel > 0 ? 1 : -1;
    };
    this.root.addEventListener("pointerup", end, { signal });
    this.root.addEventListener("pointercancel", end, { signal });
    const ready = document.fonts?.ready ?? Promise.resolve();
    void ready.then(() => {
      if (!signal.aborted) this.setup();
    });
  }

  destroy(): void {
    this.abort.abort();
    cancelAnimationFrame(this.raf);
    this.svg.remove();
  }

  private buildStarDefs(defs: SVGDefsElement): void {
    const fx = `${this.id}-fx`;
    const f = el("filter", { id: fx, x: "-30%", y: "-30%", width: "160%", height: "175%", "color-interpolation-filters": "sRGB" }, defs);
    el("feColorMatrix", { in: "SourceGraphic", type: "matrix", values: "0.80 0 0 0 0  0 0.50 0 0 0  0 0 0.56 0 0  0 0 0 1 0", result: "body" }, f); // brick red to oxblood, shading kept
    el("feMorphology", { in: "SourceAlpha", operator: "erode", radius: "1.1", result: "core" }, f);
    el("feComposite", { in: "SourceAlpha", in2: "core", operator: "out", result: "edge" }, f);
    el("feFlood", { "flood-color": "#e4c9ab", "flood-opacity": "0.95", result: "champ" }, f);
    el("feComposite", { in: "champ", in2: "edge", operator: "in", result: "rim" }, f); // champagne rim
    el("feGaussianBlur", { in: "SourceAlpha", stdDeviation: "3", result: "blur" }, f);
    el("feOffset", { in: "blur", dx: "0", dy: "4", result: "off" }, f);
    el("feFlood", { "flood-color": "#1a0a02", "flood-opacity": "0.6", result: "shc" }, f);
    el("feComposite", { in: "shc", in2: "off", operator: "in", result: "shadow" }, f); // warm soft shadow
    const merge = el("feMerge", {}, f);
    for (const r of ["shadow", "body", "rim"]) el("feMergeNode", { in: r }, merge);
    const mask = el("mask", { id: `${this.id}-mask`, maskUnits: "userSpaceOnUse", x: "0", y: "0", width: STAR_SIZE, height: STAR_SIZE, style: "mask-type:alpha" }, defs);
    el("image", { href: this.sprite, width: STAR_SIZE, height: STAR_SIZE }, mask); // the star's own silhouette
    const g = el("linearGradient", { id: `${this.id}-glint`, x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
    el("stop", { offset: "0", "stop-color": "#fff3d6", "stop-opacity": "0" }, g);
    el("stop", { offset: "0.5", "stop-color": "#fff3d6", "stop-opacity": "0.7" }, g);
    el("stop", { offset: "1", "stop-color": "#fff3d6", "stop-opacity": "0" }, g);
  }

  private layout(): number {
    this.items = [];
    let pos = 0;
    this.pieces.forEach((piece, i) => {
      if (piece) {
        this.measure.textContent = piece;
        const width = this.measure.getComputedTextLength();
        this.items.push({ kind: "word", text: piece, x: pos, width });
        pos += width;
      }
      if (i < this.pieces.length - 1) {
        this.items.push({ kind: "star", centre: pos + SLOT / 2 });
        pos += SLOT;
      }
    });
    return pos;
  }

  private build(n: number): void {
    this.words.forEach((w) => w.el.remove());
    this.stars.forEach((s) => s.group.remove());
    this.words = [];
    this.stars = [];
    for (let k = 0; k < n; k++) {
      for (const it of this.items) {
        if (it.kind === "word") {
          const t = el("text", { class: "curved-loop__text" });
          const tp = el("textPath", { href: `#${this.id}` }, t);
          tp.textContent = it.text;
          this.svg.appendChild(t);
          this.words.push({ el: t, path: tp, x: k * this.spacing + it.x, width: it.width });
        } else {
          const g = el("g", {});
          g.style.pointerEvents = "none";
          g.style.display = "none";
          el("image", { href: this.sprite, width: STAR_SIZE, height: STAR_SIZE, filter: `url(#${this.id}-fx)` }, g);
          const clip = el("g", { mask: `url(#${this.id}-mask)` }, g);
          const glint = el("rect", { x: "-30", y: "-6", width: "24", height: STAR_SIZE + 12, fill: `url(#${this.id}-glint)`, transform: "rotate(18 30 30)" }, clip);
          this.svg.appendChild(g);
          this.stars.push({ d0: k * this.spacing + it.centre, group: g, glint });
        }
      }
    }
    this.plen = this.path.getTotalLength();
  }

  private moveWords(): void {
    for (const w of this.words) {
      const x = this.offset + w.x;
      const on = x < this.plen && x + w.width > -20;
      w.el.style.display = on ? "" : "none";
      if (on) w.path.setAttribute("startOffset", `${x.toFixed(2)}px`);
    }
  }

  private place(): void {
    this.stars.forEach((st, i) => {
      const d = this.offset + st.d0;
      if (d < 0 || d > this.plen) {
        st.group.style.display = "none";
        return;
      }
      const p0 = this.path.getPointAtLength(d);
      const pa = this.path.getPointAtLength(Math.max(0, d - 2));
      const pb = this.path.getPointAtLength(Math.min(this.plen, d + 2));
      const rot = Math.atan2(pb.y - pa.y, pb.x - pa.x);
      const up = 0.34 * FONT_SIZE; // centre of the glyph: a third of an em above the baseline
      const cx = p0.x + up * Math.sin(rot);
      const cy = p0.y - up * Math.cos(rot);
      if (cx < -80 || cx > this.vw + 80) {
        st.group.style.display = "none";
        return;
      }
      const sx = 1 - 0.1 * Math.abs(Math.sin(rot * 1.6)); // turns a little like a metal object as it rides the curve
      const wob = 3 * Math.sin(cx / 150 + i);
      st.group.setAttribute(
        "transform",
        `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${((rot * 180) / Math.PI + wob).toFixed(2)}) scale(${sx.toFixed(3)} 1) translate(${-STAR_SIZE / 2} ${-STAR_SIZE / 2})`,
      );
      st.group.style.display = "";
      const gp = (cx / 520 + i * 0.37) % 1; // the glint sweeps across once every ~520px of travel
      st.glint.setAttribute("x", (-30 + 96 * (gp < 0 ? gp + 1 : gp)).toFixed(1));
    });
  }

  private wrap(): void {
    if (this.offset <= -this.spacing) this.offset += this.spacing;
    if (this.offset > 0) this.offset -= this.spacing;
  }

  private setup = (): void => {
    this.spacing = this.layout();
    if (!this.spacing || !this.items.some((it) => it.kind === "word" && it.width)) {
      this.raf = requestAnimationFrame(this.setup);
      return;
    }
    const len = this.path.getTotalLength();
    this.build(Math.ceil(len / this.spacing) + 2);
    this.offset = -this.spacing;
    this.moveWords();
    this.place();
    if (!this.reduce) this.raf = requestAnimationFrame(this.step);
  };

  private step = (now: number): void => {
    this.raf = requestAnimationFrame(this.step);
    if (!this.visible) {
      this.last = now;
      return; // off screen: idle
    }
    const dt = Math.min(0.05, (now - this.last) / 1000) * 60;
    this.last = now;
    if (!this.dragging) this.offset += this.dir * this.speed * dt;
    this.wrap();
    this.moveWords();
    this.place();
  };
}
