"use client";

import { useEffect, useRef } from "react";

const WORD = "SANCHEZ";
const COPIES = 8;

/** Huge SANCHEZ line that drifts left; scroll velocity speeds it up or reverses it. Idle while off screen; still with reduced motion. */
export function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let v = 0;
    let lastY = window.scrollY;
    let last = performance.now();
    let visible = true;
    let raf = 0;
    const io = new IntersectionObserver((e) => (visible = e[0]?.isIntersecting ?? true), { rootMargin: "150px" });
    io.observe(track.parentElement ?? track);
    const frame = (now: number): void => {
      raf = requestAnimationFrame(frame);
      if (!visible) {
        last = now;
        lastY = window.scrollY;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const y = window.scrollY;
      const sv = (y - lastY) / Math.max(dt, 0.001);
      lastY = y;
      v += (sv * 0.004 - v) * Math.min(1, dt * 6); // smoothed scroll velocity
      const dir = v < -0.3 ? -1 : 1;
      x -= (2.2 + Math.abs(v) * 1.6) * dir * dt; // % per second
      const half = 50; // the track holds two copies of the loop
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}%,0,0)`;
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <section className="sz-marquee" aria-hidden="true">
      <div className="sz-marquee__track" data-marquee ref={trackRef}>
        {Array.from({ length: COPIES }, (_, i) => (
          <span key={i}>{WORD}</span>
        ))}
      </div>
    </section>
  );
}
