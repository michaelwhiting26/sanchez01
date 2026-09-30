"use client";

import { useEffect, useRef } from "react";

const WORD = "SANCHEZ";
const COPIES = 8;
const ROWS = 3;

/** Three stacked huge SANCHEZ lines that drift left, each a little out of phase with the one above; scroll velocity speeds it up or reverses it. Idle while off screen; still with reduced motion. */
export function Marquee() {
  const tracksRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const tracks = tracksRef.current.filter((t): t is HTMLDivElement => t !== null);
    if (!tracks.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const half = 50; // each track holds two copies of the loop
    let x = 0;
    let v = 0;
    let lastY = window.scrollY;
    let last = performance.now();
    let visible = true;
    let raf = 0;
    const io = new IntersectionObserver((e) => (visible = e[0]?.isIntersecting ?? true), { rootMargin: "150px" });
    io.observe(tracks[0]?.parentElement ?? tracks[0]!);
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
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      // every row shares the same motion, started a different distance along so the words never stack in a column
      tracks.forEach((t, r) => {
        const rx = (((x - r * 17) % half) + half) % half - half;
        t.style.transform = `translate3d(${rx}%,0,0)`;
      });
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <section className="sz-marquee" aria-hidden="true">
      {Array.from({ length: ROWS }, (_, r) => (
        <div
          key={r}
          className={r % 2 === 1 ? "sz-marquee__track sz-marquee__track--alt" : "sz-marquee__track"}
          data-marquee
          ref={(el) => {
            tracksRef.current[r] = el;
          }}
        >
          {Array.from({ length: COPIES }, (_, i) => (
            <span key={i}>{WORD}</span>
          ))}
        </div>
      ))}
    </section>
  );
}
