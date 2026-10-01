"use client";

import { useEffect, useRef } from "react";
import { subscribe } from "@/lib/frame";

/**
 * The dive into the DNA (between the SANCHEZ rows and the spiral's hand-off to the bag). One tall section with a sticky full-screen stage, scrubbed by scroll:
 *   in   (first IN of the section):  the page (the fixed spiral + field canvases) swirls and shrinks into the centre point on the spiral's axis while an event
 *                                    horizon closes in from all four corners; then the ride opens out of that point.
 *   ride (middle):                   the DNA cylinder ride (public/dna-dive/, the :4001 prototype) driven by the same scroll.
 *   out  (last OUT):                 the exact reverse, so the page unwinds to where it was and the spiral carries on into the bag as if you never left.
 * Smooth: every visual is transform/opacity only, from one eased value that chases the scroll (no layout, no scroll-linked jumps).
 */
const IN = 0.16;
const OUT = 0.16;
const PAGE_LAYERS = ".dna-core, .wm-field";
/** How far the page zooms into the DNA before the ride takes over (scale), accelerating like a fall. */
const ZOOM = 14;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (v: number) => { const x = clamp01(v); return x * x * x * (x * (x * 6 - 15) + 10); }; // smootherstep

type DiveWindow = Window & { __dive?: (p: number) => void; __diveActive?: (on: boolean) => void; __diveFrame?: (t: number) => void };

export function DnaDive() {
  const section = useRef<HTMLElement>(null);
  const ride = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const sec = section.current, rideEl = ride.current, ifr = frame.current;
    if (!sec || !rideEl || !ifr) return;
    const layers = Array.from(document.querySelectorAll<HTMLElement>(PAGE_LAYERS));
    let active = false, pending = true;
    let rect: DOMRect | null = null;
    const apply = (p: number) => {
      const inside = Math.min(ease(p / IN), ease((1 - p) / OUT)); // 0 = on the page, 1 = fully inside the ride
      // zoom hard into the DNA's centre; the ride fades up over the last part of the zoom (about two helix turns of scroll), no flip
      const close = ease(inside / 0.85), open = ease((inside - 0.28) / 0.42);
      // the page swirls into the centre point
      for (const el of layers) {
        if (close <= 0) { el.style.transform = ""; el.style.opacity = ""; continue; }
        el.style.transform = `scale(${Math.pow(ZOOM, close * close).toFixed(4)})`;
        el.style.opacity = String((1 - open).toFixed(3));
      }
      // the ride opens out of the same point, unwinding
      rideEl.style.opacity = String(open.toFixed(3));
      rideEl.style.transform = `scale(${(1.25 - 0.25 * open).toFixed(4)})`; // settles in as it arrives, continuing the zoom
      rideEl.style.visibility = open > 0 ? "visible" : "hidden";
      const w: DiveWindow | null = ifr.contentWindow;
      const on = open > 0;
      if (on !== active) { active = on; w?.__diveActive?.(on); }
      if (on) w?.__dive?.(0.07 + 0.93 * clamp01((p - IN) / (1 - IN - OUT))); // start just past the ride's first dot: we arrive by zoom, already inside the cylinder
    };
    // one clock (lib/frame.ts), and no smoothing of its own: Lenis already smooths the scroll, a second ease here only added lag.
    //   read:   the section's box, when the page moved (or after a resize / the ride loading)
    //   write:  zoom and fade, a pure function of the section's progress
    //   render: the ride iframe draws its frame from this same clock (it runs no loop of its own while driven)
    const kick = (): void => {
      pending = true;
    };
    const offs = [
      subscribe("read", (_t, _dt, sc) => {
        rect = sc.changed || pending ? sec.getBoundingClientRect() : null;
        pending = false;
      }),
      subscribe("write", () => {
        if (!rect) return;
        const vh = window.innerHeight;
        // load the ride only when the dive is within two screens (it was fetched with the page: ~3 MB of 3D before anyone scrolled)
        if (!ifr.src && rect.top < vh * 3 && rect.bottom > -vh * 2 && ifr.dataset["src"]) ifr.src = ifr.dataset["src"];
        if (rect.bottom < -vh || rect.top > vh * 2) { if (active || layers.some((el) => el.style.transform)) apply(rect.top > 0 ? 0 : 1); return; } // far away: settle once
        apply(clamp01(-rect.top / Math.max(1, rect.height - vh)));
      }),
      subscribe("render", (t) => {
        if (!active) return;
        const w: DiveWindow | null = ifr.contentWindow;
        w?.__diveFrame?.(t);
      }),
    ];
    window.addEventListener("resize", kick);
    // until the ride has loaded, its poster (the ride's own opening frame) shows: the zoom never lands on an empty screen
    ifr.addEventListener("load", () => { active = false; rideEl.classList.add("is-ready"); kick(); });
    return () => {
      for (const off of offs) off();
      window.removeEventListener("resize", kick);
      for (const el of layers) { el.style.transform = ""; el.style.opacity = ""; }
    };
  }, []);

  return (
    <section ref={section} className="dna-dive" aria-label="Inside the Sanchez DNA">
      <div className="dna-dive__stage">
        <div ref={ride} className="dna-dive__ride">
          <img className="dna-dive__poster" src="/dna-dive/poster.webp" alt="" aria-hidden="true" width={1600} height={1000} loading="lazy" decoding="async" />
          <iframe ref={frame} data-src="/dna-dive/index.html" title="Inside the Sanchez DNA" tabIndex={-1} />
        </div>
      </div>
    </section>
  );
}
