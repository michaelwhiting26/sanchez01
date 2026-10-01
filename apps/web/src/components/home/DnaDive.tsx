"use client";

import { useEffect, useRef } from "react";

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

type DiveWindow = Window & { __dive?: (p: number) => void; __diveActive?: (on: boolean) => void };

export function DnaDive() {
  const section = useRef<HTMLElement>(null);
  const ride = useRef<HTMLDivElement>(null);
  const hole = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const sec = section.current, rideEl = ride.current, holeEl = hole.current, ifr = frame.current;
    if (!sec || !rideEl || !holeEl || !ifr) return;
    const layers = Array.from(document.querySelectorAll<HTMLElement>(PAGE_LAYERS));
    let smooth = 0, raf = 0, running = false, active = false;

    const target = () => {
      const r = sec.getBoundingClientRect();
      return clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
    };
    const near = () => {
      const r = sec.getBoundingClientRect();
      return r.bottom > -window.innerHeight && r.top < window.innerHeight * 2;
    };
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
      // event horizon: a soft hole that closes from the corners to the centre (scale only)
      holeEl.style.opacity = "0";
      // the ride opens out of the same point, unwinding
      rideEl.style.opacity = String(open.toFixed(3));
      rideEl.style.transform = `scale(${(1.25 - 0.25 * open).toFixed(4)})`; // settles in as it arrives, continuing the zoom
      rideEl.style.visibility = open > 0 ? "visible" : "hidden";
      const w: DiveWindow | null = ifr.contentWindow;
      const on = open > 0;
      if (on !== active) { active = on; w?.__diveActive?.(on); }
      if (on) w?.__dive?.(0.07 + 0.93 * clamp01((p - IN) / (1 - IN - OUT))); // start just past the ride's first dot: we arrive by zoom, already inside the cylinder
    };
    const tick = () => {
      const t = target();
      smooth += (t - smooth) * 0.14;
      if (Math.abs(t - smooth) < 0.0004) smooth = t;
      apply(smooth);
      if (near() || smooth !== t) raf = requestAnimationFrame(tick);
      else { running = false; raf = 0; }
    };
    const wake = () => { if (!running && near()) { running = true; raf = requestAnimationFrame(tick); } };
    smooth = target();
    apply(smooth);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    ifr.addEventListener("load", () => { active = false; apply(smooth); });
    wake();
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      if (raf) cancelAnimationFrame(raf);
      for (const el of layers) { el.style.transform = ""; el.style.opacity = ""; }
    };
  }, []);

  return (
    <section ref={section} className="dna-dive" aria-label="Inside the Sanchez DNA">
      <div className="dna-dive__stage">
        <div ref={hole} className="dna-dive__hole" aria-hidden="true" />
        <div ref={ride} className="dna-dive__ride">
          <iframe ref={frame} src="/dna-dive/index.html" title="Inside the Sanchez DNA" tabIndex={-1} loading="eager" />
        </div>
      </div>
    </section>
  );
}
