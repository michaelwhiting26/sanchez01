/**
 * Behaviours layered over the vendored Liquid Glass Carousel (MIT, componentry.dev; build in /public/assets/carousel/lgc.bundle.js).
 * The bundle is left untouched: these functions only press its own arrow keys, read its "01/06" counter, and draw around it.
 * Each returns a cleanup function.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

function counterText(host: Element): string {
  return host.querySelector(".tabular-nums")?.textContent ?? "";
}

/**
 * Workshop gallery driven by page scroll. The section sits in a tall track and is pinned (CSS sticky) while you scroll through it; the further you
 * scroll, the further the carousel moves sideways. A real drag, tap or key press on the carousel takes over until the next scroll.
 */
/** Pixels of film that pass while the gallery is scrolled from the first slide to the last. */
export const FILM_TRAVEL = 2600;

export interface GalleryScrollOptions {
  /** Play the gallery through on its own the first time it is reached, locking the page until it has finished. */
  autoplay: boolean;
  /** How long each slide holds, in ms: a few seconds for a photo, the video's own length for a video. */
  dwellMs: readonly number[];
}

export function attachGalleryScroll(track: HTMLElement, host: HTMLElement, pin: HTMLElement, options?: GalleryScrollOptions): () => void {
  const GAP_MS = window.matchMedia("(pointer: coarse)").matches ? 70 : 140; // between key presses while catching up
  const REACH = 0.85; // the last slide is reached at 85% of the track; the rest is a short hold before the page carries on
  let hold = false;
  let lastPress = 0;
  let live = false;
  let raf = 0;
  let steps = 0;

  const total = (): number => {
    const m = /\/\s*(\d+)/.exec(counterText(host));
    return m?.[1] ? parseInt(m[1], 10) : 0;
  };
  const current = (): number => {
    const m = /(\d+)\s*\//.exec(counterText(host));
    return m?.[1] ? parseInt(m[1], 10) - 1 : -1;
  };
  const press = (dir: 1 | -1): void => {
    host.firstElementChild?.dispatchEvent(new KeyboardEvent("keydown", { key: dir > 0 ? "ArrowRight" : "ArrowLeft", bubbles: true, cancelable: true }));
  };
  const progress = (): number => {
    const head = parseFloat(getComputedStyle(track).getPropertyValue("--header-h")) || 0; // 0 on pages without a navbar
    const travel = track.offsetHeight - pin.offsetHeight;
    if (travel <= 0) return 0;
    return Math.max(0, Math.min(1, (head - track.getBoundingClientRect().top) / travel));
  };
  let lastCur = -1;
  let flickTimer = 0;
  let dead = false;
  let auto: "idle" | "running" | "done" = options?.autoplay ? "idle" : "done";
  let settling = false;
  let lockY = 0;
  const BLOCKED = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"]);
  // Resistance, not a wall: scroll attempts push against the held page (it bounces) and a few hard swipes break through and release it.
  const THRESH = 600;
  const DECAY = 450; // units of push that drain away every second
  let energy = 0;
  let energyAt = 0;
  let lastBump = 0;
  let touchY = 0;
  let skip = false;
  let ff = false; // the Skip button is fast-forwarding to the last slide: hold the page until it gets there
  const bump = (dir: number, k: number): void => {
    const d = 5 + 30 * Math.min(1, k);
    pin.style.transition = "transform 70ms ease-out";
    pin.style.transform = `translate3d(0, ${(-dir * d).toFixed(1)}px, 0)`;
    window.setTimeout(() => {
      pin.style.transition = "transform .55s cubic-bezier(.2,1.9,.35,1)"; // springs back past centre and settles
      pin.style.transform = "";
    }, 80);
  };
  const push = (amount: number, dir: number): void => {
    const now = performance.now();
    energy = Math.max(0, energy - ((now - energyAt) / 1000) * DECAY) + amount;
    energyAt = now;
    if (energy >= THRESH) {
      skip = true; // enough hard pushing: let go
      unlock();
      auto = "done";
      window.dispatchEvent(new CustomEvent("gallery:autoplay-done", { detail: { skipped: true } }));
      return;
    }
    if (now - lastBump > 90) {
      lastBump = now;
      bump(dir, energy / THRESH);
    }
  };
  const onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    push(Math.abs(e.deltaY), Math.sign(e.deltaY) || 1);
  };
  const onTouchStart = (e: TouchEvent): void => {
    touchY = e.touches[0]?.clientY ?? 0;
  };
  const onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    const y = e.touches[0]?.clientY ?? touchY;
    const dy = touchY - y;
    touchY = y;
    if (dy) push(Math.abs(dy) * 2.2, Math.sign(dy));
  };
  const onKey = (e: KeyboardEvent): void => {
    if (!BLOCKED.has(e.key)) return;
    e.preventDefault();
    push(260, e.key === "ArrowUp" || e.key === "PageUp" || e.key === "Home" ? -1 : 1);
  };
  // The Skip button (bottom right, from slide 2 on, while the page is held): run quickly through the remaining slides to the end of the last one,
  // hold it for a beat, then release the page and carry on past the gallery.
  const skipNow = (): void => {
    if (auto !== "running" || ff) return;
    ff = true;
    skip = true; // stops the slow autoplay loop; the page stays locked until the fast run is done
    void (async () => {
      const n = total();
      const t0 = performance.now();
      while (!dead && current() < n - 1 && performance.now() - t0 < 7000) {
        const before = current();
        press(1);
        for (let w = 0; w < 14 && current() === before; w++) await sleep(45); // wait for the carousel to take the step
        await sleep(110);
      }
      await sleep(600); // a beat on the last slide
      unlock();
      auto = "done";
      window.dispatchEvent(new CustomEvent("gallery:autoplay-done", { detail: { skipped: true } }));
      const trackBottom = track.getBoundingClientRect().bottom + window.scrollY;
      window.scrollTo({ top: Math.max(0, trackBottom - window.innerHeight * 0.55), behavior: "smooth" });
    })();
  };
  window.addEventListener("gallery:skip", skipNow);
  const holdPos = (): void => {
    if (Math.abs(window.scrollY - lockY) > 1) window.scrollTo(0, lockY);
  };
  const lock = (): void => {
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", holdPos, { passive: true });
    document.documentElement.classList.add("gallery-locked");
  };
  const unlock = (): void => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", holdPos);
    document.documentElement.classList.remove("gallery-locked", "gallery-skippable");
  };
  const sleep = (ms: number): Promise<void> => new Promise((r) => window.setTimeout(r, ms));
  // The film plays live in the gallery itself: when it is first reached the page locks (however hard someone scrolls), the carousel runs the six slides in
  // order (photos hold a few seconds, videos play out), then the page is released.
  const runAutoplay = async (): Promise<void> => {
    auto = "running";
    const head = parseFloat(getComputedStyle(track).getPropertyValue("--header-h")) || 0;
    const docTop = track.getBoundingClientRect().top + window.scrollY;
    lockY = docTop - head + 1;
    window.scrollTo(0, lockY);
    lock();
    const n = total();
    for (let g = 0; g < n && current() > 0 && !dead && !skip; g++) {
      press(-1);
      await sleep(700);
    }
    for (let i = 0; i < n && !dead && !skip; i++) {
      await sleep(options?.dwellMs[i] ?? 4500);
      if (i < n - 1 && !skip) {
        press(1);
        await sleep(1000); // the carousel's own move to the next slide
      }
    }
    if (!ff) unlock();
    if (dead || skip) return; // the reader pushed through: they carry on from wherever they are
    auto = "done";
    window.dispatchEvent(new CustomEvent("gallery:autoplay-done", { detail: { skipped: false } }));
    settling = true;
    const travel = track.offsetHeight - pin.offsetHeight;
    window.scrollTo({ top: docTop - head + REACH * travel, behavior: "smooth" }); // released: carry on down from the last slide
  };
  const tick = (now: number): void => {
    if (!live) return;
    const n = total();
    const cur = current();
    if (auto === "idle" && n > 1 && cur >= 0 && progress() > 0.001) void runAutoplay();
    if (auto === "running") {
      document.documentElement.classList.toggle("gallery-skippable", cur >= 1 && !ff); // Skip only appears from slide 2
      raf = requestAnimationFrame(tick);
      return;
    }
    if (settling) {
      if (progress() >= REACH - 0.03) settling = false;
      else {
        raf = requestAnimationFrame(tick);
        return;
      }
    }
    pin.style.setProperty("--film-x", (progress() * FILM_TRAVEL).toFixed(1)); // the film tape behind the gallery runs with the scroll
    if (cur >= 0 && cur !== lastCur) {
      if (lastCur >= 0 && n > 1 && (cur === 0 || cur === n - 1)) {
        pin.classList.remove("is-flick"); // the film flicks as it runs out at either end
        void pin.offsetWidth;
        pin.classList.add("is-flick");
        window.clearTimeout(flickTimer);
        flickTimer = window.setTimeout(() => pin.classList.remove("is-flick"), 600);
      }
      lastCur = cur;
    }
    if (n > 1 && steps !== n) {
      steps = n;
      track.style.setProperty("--lgc-steps", String(n - 1)); // track length follows the slide count
    }
    // the gate: the page cannot leave the pinned gallery until the carousel has run to the last slide (a phone flick can carry straight past the end)
    if (n > 1 && cur >= 0 && cur < n - 1 && progress() > REACH + 0.01) {
      const headG = parseFloat(getComputedStyle(track).getPropertyValue("--header-h")) || 0;
      const docTop = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, docTop - headG + REACH * (track.offsetHeight - pin.offsetHeight));
    }
    if (n > 1 && cur >= 0 && (!hold || (cur < n - 1 && progress() >= REACH))) {
      const want = Math.min(n - 1, Math.round(Math.min(1, progress() / REACH) * (n - 1)));
      if (want !== cur && now - lastPress > GAP_MS) {
        press(want > cur ? 1 : -1);
        lastPress = now;
      }
    }
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(
    (entries) => {
      const on = entries[0]?.isIntersecting ?? false;
      if (on && !live) {
        live = true;
        raf = requestAnimationFrame(tick);
      } else if (!on) {
        live = false;
      }
    },
    { rootMargin: "20% 0px 20% 0px" },
  );
  io.observe(track);
  const trusted = (e: Event): void => {
    if (e.isTrusted) hold = true; // a real interaction wins until the page is scrolled again
  };
  const release = (): void => {
    hold = false;
  };
  host.addEventListener("pointerdown", trusted, true);
  host.addEventListener("keydown", trusted, true);
  window.addEventListener("scroll", release, { passive: true });
  return () => {
    dead = true;
    window.removeEventListener("gallery:skip", skipNow);
    unlock();
    live = false;
    cancelAnimationFrame(raf);
    io.disconnect();
    host.removeEventListener("pointerdown", trusted, true);
    host.removeEventListener("keydown", trusted, true);
    window.removeEventListener("scroll", release);
  };
}

/** Over the gallery the mouse pointer becomes a small ruler, 1 to N cm along a horizontal axis. Mouse and trackpad only; touch is untouched. */
export function attachGalleryRuler(host: HTMLElement, count: number): () => void {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  const stage = host.parentElement;
  if (!stage) return () => {};
  const CM = 36;
  const N = count || 6;
  const W = CM * N + 36;
  const H = 54;
  const AX = 38;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const wrap = document.createElement("div");
  wrap.className = "lgc-ruler";
  wrap.setAttribute("aria-hidden", "true");
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", String(W));
  svg.setAttribute("height", String(H));
  const el = (tag: string, attrs: Record<string, string | number>): SVGElement => {
    const e = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    svg.appendChild(e);
    return e;
  };
  const fill = el("rect", { class: "lgc-ruler__fill", x: 1, y: AX - 2, height: 4, width: 0 });
  el("line", { class: "lgc-ruler__ink", x1: 1, y1: AX - 28, x2: 1, y2: AX + 10, "stroke-width": 2.2 }); // the pointer
  el("line", { class: "lgc-ruler__ink", x1: 1, y1: AX, x2: CM * N + 8, y2: AX, "stroke-width": 1 }); // the axis
  el("path", { class: "lgc-ruler__arrow", d: `M${CM * N + 8} ${AX - 4} l6 4 -6 4` });
  const labels: SVGElement[] = [];
  for (let t = 1; t <= N * 4; t++) {
    const x = 1 + (t * CM) / 4;
    const major = t % 4 === 0;
    const half = t % 2 === 0;
    el("line", { class: "lgc-ruler__ink", x1: x, y1: AX, x2: x, y2: AX - (major ? 11 : half ? 7 : 4), "stroke-width": major ? 1.2 : 0.8 });
    if (major) {
      const label = el("text", { class: "lgc-ruler__num", x, y: AX - 16, "text-anchor": "middle" });
      label.textContent = String(t / 4);
      labels.push(label);
    }
  }
  wrap.appendChild(svg);
  stage.appendChild(wrap);

  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let on = false;
  let raf = 0;
  const frame = (): void => {
    const k = reduce ? 1 : 0.55;
    cx += (tx - cx) * k;
    cy += (ty - cy) * k;
    wrap.style.transform = `translate3d(${cx - 1}px,${cy - AX}px,0)`;
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.2 ? requestAnimationFrame(frame) : 0;
  };
  const move = (e: PointerEvent): void => {
    if (e.pointerType !== "mouse") return;
    const r = stage.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    if (!on) {
      cx = tx;
      cy = ty;
      on = true;
      wrap.classList.add("is-on");
    }
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const leave = (): void => {
    on = false;
    wrap.classList.remove("is-on");
  };
  const down = (): void => wrap.classList.add("is-down");
  const up = (): void => wrap.classList.remove("is-down");
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  host.addEventListener("pointerdown", down);
  window.addEventListener("pointerup", up);

  // the current slide comes from the carousel's own counter
  const sync = (): void => {
    const m = /(\d+)\s*\/\s*(\d+)/.exec(counterText(host));
    if (!m?.[1]) return;
    const i = Math.max(1, Math.min(N, parseInt(m[1], 10)));
    labels.forEach((l, j) => l.classList.toggle("is-active", j === i - 1));
    fill.setAttribute("width", String(i * CM));
  };
  const mo = new MutationObserver(sync);
  mo.observe(host, { subtree: true, childList: true, characterData: true });
  sync();
  return () => {
    cancelAnimationFrame(raf);
    mo.disconnect();
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerleave", leave);
    host.removeEventListener("pointerdown", down);
    window.removeEventListener("pointerup", up);
    wrap.remove();
  };
}

/** When you click into an image, a short paragraph appears under it. The words are each slide's `note` (PLACEHOLDER until Jesse writes them). */
export function attachGalleryNote(host: HTMLElement, notes: ReadonlyMap<string, string>): () => void {
  const stage = host.parentElement;
  if (!stage) return () => {};
  const note = document.createElement("p");
  note.className = "lgc-note";
  note.setAttribute("aria-live", "polite");
  stage.appendChild(note);
  let last = "";
  const sync = (): void => {
    const close = host.querySelector<HTMLElement>('button[aria-label="Close focused project"]');
    const title = host.querySelector('p[class*="top-[4.5%]"]');
    const open = !!close && close.style.opacity === "1";
    const t = title?.textContent?.trim() ?? "";
    const text = open ? (notes.get(t) ?? "") : "";
    if (text !== last) {
      last = text;
      if (text) note.textContent = text;
    }
    note.classList.toggle("is-on", !!text);
  };
  const mo = new MutationObserver(sync);
  mo.observe(host, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["style"] });
  sync();
  return () => {
    mo.disconnect();
    note.remove();
  };
}
