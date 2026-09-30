/**
 * The gallery as one continuous film. A full-screen player that runs every slide in order like a single movie: photos hold for a few seconds (slow
 * push-in), videos play to their end, and every join is an animated transition (dissolve, push, amber light-leak flash, in turn). Framework-free:
 * `open()` builds the overlay, `destroy()` removes it. Tap right/left or use the arrow keys to skip; Esc or the close button leaves.
 */
export interface ReelItem {
  readonly title: string;
  readonly src: string;
  readonly video?: string | undefined;
}

const PHOTO_MS = 4500;
const XFADE = 850;
const pad = (n: number): string => (n < 10 ? "0" : "") + n;

interface Layer extends HTMLDivElement {
  _video?: HTMLVideoElement;
}

export class GalleryReel {
  private root: HTMLDivElement | null = null;
  private stage!: HTMLDivElement;
  private flash!: HTMLDivElement;
  private titleEl!: HTMLDivElement;
  private countEl!: HTMLDivElement;
  private bars!: HTMLDivElement;
  private idx = -1;
  private timer = 0;
  private raf = 0;
  private token = 0;
  private cur: Layer | null = null;
  private isOpen = false;
  private returnFocus: HTMLElement | null = null;
  private readonly reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private readonly onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") this.close();
    else if (e.key === "ArrowRight") this.go(this.idx + 1);
    else if (e.key === "ArrowLeft") this.go(this.idx - 1);
  };

  constructor(private readonly items: readonly ReelItem[]) {}

  get opened(): boolean {
    return this.isOpen;
  }

  open(returnFocus?: HTMLElement | null): void {
    if (this.isOpen || !this.items.length) return;
    this.returnFocus = returnFocus ?? null;
    if (!this.root) this.build();
    const root = this.root;
    if (!root) return;
    this.isOpen = true;
    document.documentElement.classList.add("reel-open");
    root.classList.add("is-open");
    this.stage.innerHTML = "";
    this.cur = null;
    this.idx = -1;
    window.addEventListener("keydown", this.onKey);
    this.go(0);
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.token++;
    window.clearTimeout(this.timer);
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKey);
    this.root?.classList.remove("is-open");
    document.documentElement.classList.remove("reel-open");
    window.setTimeout(() => {
      if (!this.isOpen) this.stage.innerHTML = "";
    }, 500);
    this.returnFocus?.focus({ preventScroll: true });
  }

  destroy(): void {
    this.close();
    this.root?.remove();
    this.root = null;
  }

  private build(): void {
    const root = document.createElement("div");
    root.className = "reel";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "The workshop film");
    root.innerHTML =
      '<div class="reel__stage"></div><div class="reel__flash"></div><div class="reel__film reel__film--t"></div><div class="reel__film reel__film--b"></div>' +
      '<div class="reel__title"></div><div class="reel__count"></div><div class="reel__bars"></div>' +
      '<button type="button" class="reel__close" aria-label="Close the film">Close</button><div class="reel__tap reel__tap--l"></div><div class="reel__tap reel__tap--r"></div>';
    document.body.appendChild(root);
    this.root = root;
    this.stage = root.querySelector(".reel__stage") as HTMLDivElement;
    this.flash = root.querySelector(".reel__flash") as HTMLDivElement;
    this.titleEl = root.querySelector(".reel__title") as HTMLDivElement;
    this.countEl = root.querySelector(".reel__count") as HTMLDivElement;
    this.bars = root.querySelector(".reel__bars") as HTMLDivElement;
    for (let i = 0; i < this.items.length; i++) {
      const b = document.createElement("i");
      b.innerHTML = "<b></b>";
      this.bars.appendChild(b);
    }
    root.querySelector(".reel__close")?.addEventListener("click", () => this.close());
    root.querySelector(".reel__tap--l")?.addEventListener("click", () => this.go(this.idx - 1));
    root.querySelector(".reel__tap--r")?.addEventListener("click", () => this.go(this.idx + 1));
  }

  private makeLayer(item: ReelItem): Layer {
    const layer = document.createElement("div") as Layer;
    layer.className = "reel__layer";
    if (item.video) {
      const v = document.createElement("video");
      v.muted = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.preload = "auto";
      v.poster = item.src;
      v.src = item.video;
      layer.appendChild(v);
      layer._video = v;
    } else {
      const im = document.createElement("img");
      im.alt = "";
      im.src = item.src;
      layer.appendChild(im);
    }
    return layer;
  }

  private transition(next: Layer, prev: Layer | null, n: number): void {
    const kind = n % 3; // dissolve, push, light-leak
    const ease = "cubic-bezier(.4,0,.2,1)";
    const dur = this.reduced ? 1 : XFADE;
    if (!prev) {
      next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: this.reduced ? 1 : 900, easing: "ease-out", fill: "both" });
      return;
    }
    if (kind === 0 || this.reduced) {
      next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, easing: ease, fill: "both" });
      prev.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, easing: ease, fill: "both" });
    } else if (kind === 1) {
      next.animate([{ opacity: 0, transform: "translateX(9%) scale(1.04)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: dur, easing: ease, fill: "both" });
      prev.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(-9%) scale(.97)", filter: "blur(5px)" }], { duration: dur, easing: ease, fill: "both" });
    } else {
      next.animate([{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }], { duration: dur + 150, easing: ease, fill: "both" });
      prev.animate([{ opacity: 1 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }], { duration: dur + 150, easing: ease, fill: "both" });
      this.flash.animate([{ opacity: 0 }, { opacity: 0.85, offset: 0.42 }, { opacity: 0 }], { duration: dur + 250, easing: "ease-in-out" });
    }
    this.root?.querySelector(".reel__film--t")?.animate([{ backgroundPositionX: "0" }, { backgroundPositionX: "-260px" }], { duration: dur + 200, easing: ease });
  }

  private go(target: number): void {
    if (!this.isOpen) return;
    const i = Math.max(0, target);
    if (i >= this.items.length) {
      this.close();
      return;
    }
    const item = this.items[i];
    if (!item) return;
    const my = ++this.token;
    const prev = this.cur;
    this.idx = i;
    window.clearTimeout(this.timer);
    cancelAnimationFrame(this.raf);
    const layer = this.makeLayer(item);
    this.stage.appendChild(layer);
    this.cur = layer;
    this.transition(layer, prev, i);
    if (prev) {
      window.setTimeout(() => {
        prev._video?.pause();
        prev.remove();
      }, XFADE + 400);
    }
    this.titleEl.classList.remove("is-on");
    void this.titleEl.offsetWidth;
    this.titleEl.innerHTML = `<span>${pad(i + 1)}</span>${item.title}`;
    this.titleEl.classList.add("is-on");
    this.countEl.textContent = `${pad(i + 1)} / ${pad(this.items.length)}`;
    Array.from(this.bars.children).forEach((b, k) => ((b.firstChild as HTMLElement).style.transform = `scaleX(${k < i ? 1 : 0})`));
    const startAt = performance.now();
    const bar = this.bars.children[i]?.firstChild as HTMLElement | undefined;
    const advance = (): void => {
      if (this.token === my) this.go(i + 1);
    };
    if (layer._video) {
      const v = layer._video;
      let dur = 0;
      const arm = (): void => {
        dur = v.duration && Number.isFinite(v.duration) ? v.duration : 8; // a video plays for its own length
        if (!this.reduced) v.parentElement?.animate([{ transform: "scale(1)" }, { transform: "scale(1.035)" }], { duration: dur * 1000, easing: "linear", fill: "both" });
        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(advance, dur * 1000 + 3000); // safety net if 'ended' never fires
      };
      v.addEventListener("loadedmetadata", arm, { once: true });
      v.addEventListener("ended", advance, { once: true });
      v.addEventListener("error", () => (this.timer = window.setTimeout(advance, PHOTO_MS)), { once: true });
      void v.play().catch(() => (this.timer = window.setTimeout(advance, PHOTO_MS)));
      const tick = (): void => {
        if (this.token !== my) return;
        if (bar) bar.style.transform = `scaleX(${dur ? Math.min(1, v.currentTime / dur) : 0})`;
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    } else {
      if (!this.reduced) layer.firstElementChild?.animate([{ transform: "scale(1.02) translate(0,0)" }, { transform: `scale(1.11) translate(${i % 2 ? "-" : ""}2.2%, -1.6%)` }], { duration: PHOTO_MS + XFADE, easing: "linear", fill: "both" });
      this.timer = window.setTimeout(advance, PHOTO_MS); // a still holds for a few seconds
      const tick = (): void => {
        if (this.token !== my) return;
        if (bar) bar.style.transform = `scaleX(${Math.min(1, (performance.now() - startAt) / PHOTO_MS)})`;
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }
  }
}
