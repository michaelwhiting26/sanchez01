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
const FILM_TRAVEL = 2600;

export function attachGalleryScroll(track: HTMLElement, host: HTMLElement, pin: HTMLElement): () => void {
  const GAP_MS = 140; // between key presses while catching up
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
  const tick = (now: number): void => {
    if (!live) return;
    const n = total();
    const cur = current();
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
    if (n > 1 && cur >= 0 && !hold) {
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
