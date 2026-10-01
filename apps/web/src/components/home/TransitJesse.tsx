"use client";

import { useEffect, useRef } from "react";
import { getJesseOwner, getJesseSize, onJesseOwner, setJesseStatus, type JesseStatus } from "@/lib/hero/handoff";

/**
 * Jesse in the spiral stretch (`.sz-transit`): after he walks off the gallery he floats down the middle of the DNA, facing the visitor, limbs spread and
 * hanging as if held up by his head, inside a tractor beam from above (an abduction, not a climb). Scrubbed by the scroll (reverses on scroll up): he enters
 * above the top of the screen as the stretch arrives and leaves below the bottom as it ends, with a slow sway and drift that are also functions of scroll.
 * One man only: this scene draws only while the hand-off names it the owner (lib/hero/handoff.ts gives "transit" the top priority).
 * Pose: the full-colour character (build/jesse/final.blend) rendered front-on, arms spread 40° below the shoulders (assets/home/jesse-float.webp, 600 px square).
 */
const IMG = "/assets/home/jesse-float.webp?v=3"; // v3: the full-colour character (build/jesse/final.blend), front-on

export function TransitJesse() {
  const root = useRef<HTMLDivElement>(null);
  const fig = useRef<HTMLImageElement>(null);
  const beam = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const transit = document.querySelector<HTMLElement>("[data-transit]");
    const box = root.current, el = fig.current, light = beam.current;
    if (!transit || !box || !el || !light || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ac = new AbortController();
    let raf = 0;
    let last: JesseStatus = "idle";

    const draw = () => {
      raf = 0;
      const vh = window.innerHeight, vw = window.innerWidth;
      const r = transit.getBoundingClientRect();
      const p = (vh - r.top) / (r.height + vh); // 0: the stretch's top reaches the screen bottom; 1: its bottom leaves the screen top
      const s: JesseStatus = p <= 0 ? "idle" : p >= 1 ? "spent" : "active";
      if (s !== last) { last = s; setJesseStatus("transit", s); }
      const show = s === "active" && getJesseOwner() === "transit";
      box.style.visibility = show ? "visible" : "hidden";
      if (!show) return;
      const sz = Math.round((getJesseSize() || Math.min(260, Math.max(150, vh * 0.3))) * 1.15);
      const y = -sz + p * (vh + sz); // top of the figure: from just above the screen to just below it
      const sway = Math.sin(p * Math.PI * 5) * 4; // degrees, pendulum about the head
      const drift = Math.sin(p * Math.PI * 3 + 0.6) * vw * 0.012;
      el.style.width = el.style.height = `${sz}px`;
      el.style.transform = `translate3d(${(vw / 2 - sz / 2 + drift).toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${sway.toFixed(2)}deg)`;
      // the beam: from the top of the screen, widening down to just below his feet
      light.style.height = `${Math.max(0, y + sz * 1.05).toFixed(1)}px`;
      light.style.transform = `translate3d(${(vw / 2 + drift).toFixed(1)}px, 0, 0) translateX(-50%)`;
      light.style.width = `${(sz * 1.6).toFixed(0)}px`;
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(draw); };

    window.addEventListener("scroll", queue, { passive: true, signal: ac.signal });
    window.addEventListener("resize", queue, { signal: ac.signal });
    onJesseOwner(queue, ac.signal);
    queue();
    return () => { ac.abort(); if (raf) cancelAnimationFrame(raf); setJesseStatus("transit", "idle"); };
  }, []);

  return (
    <div ref={root} className="transit-jesse" aria-hidden="true">
      <div ref={beam} className="transit-jesse__beam" />
      <img ref={fig} className="transit-jesse__fig" src={IMG} alt="" width={480} height={480} decoding="async" draggable={false} />
    </div>
  );
}
