"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent } from "react";

// Spring feel matched to BagEngine.punch (stiffness 55, damping 4.2, mass 1.3 is ~0.25 damping ratio, ~1s period), tuned for a ~1.5s settle.
const OMEGA = 6.5; // rad/s natural frequency
const ZETA = 0.3; // underdamped
const STIFF = OMEGA * OMEGA;
const DAMP = 2 * ZETA * OMEGA;
const KICK = 1.62; // rad/s of velocity per hit: peaks near 10deg
const MAX = (22 * Math.PI) / 180;
const SQUASH_HOLD = 80; // ms at full squash
const SQUASH_FADE = 120; // ms easing back

/**
 * The footer bag. Tap it (or Enter/Space when focused) and it swings from its chain hook on a damped spring, like the 3D bag in the punch section.
 * Pure 2D: one rAF loop that only runs while the bag is moving, so hits stack and there is no second WebGL context.
 */
export function BagHit() {
  const imgRef = useRef<HTMLImageElement>(null);
  const sim = useRef({ a: 0, v: 0, hitAt: -1e9, last: 0, raf: 0, flip: 1 });

  const draw = useCallback((now: number): void => {
    const s = sim.current;
    const img = imgRef.current;
    if (!img) return;
    const dt = Math.min(0.032, (now - s.last) / 1000);
    s.last = now;
    // semi-implicit Euler, two sub-steps for stability
    for (let i = 0; i < 2; i++) {
      s.v += (-STIFF * s.a - DAMP * s.v) * (dt / 2);
      s.a += s.v * (dt / 2);
    }
    const since = now - s.hitAt;
    const sq = since < SQUASH_HOLD ? 1 : Math.max(0, 1 - (since - SQUASH_HOLD) / SQUASH_FADE);
    const settled = Math.abs(s.a) < 0.0004 && Math.abs(s.v) < 0.004 && sq === 0;
    if (settled) {
      s.a = 0;
      s.v = 0;
      s.raf = 0;
      img.style.transform = "";
      return;
    }
    img.style.transform = `rotate(${s.a}rad) scale(${1 + 0.03 * sq}, ${1 - 0.02 * sq})`;
    s.raf = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const s = sim.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  const hit = (e: MouseEvent<HTMLButtonElement>): void => {
    const s = sim.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = e.currentTarget.getBoundingClientRect();
    const off = e.detail === 0 ? 0 : e.clientX - (r.left + r.width / 2); // keyboard: no position
    // tapped on the right pushes the bag left (clockwise about the hook lifts the bottom leftwards)
    let dir = Math.abs(off) < r.width * 0.05 ? s.flip : off > 0 ? 1 : -1;
    s.flip = -dir;
    dir = reduce ? dir * 0.2 : dir; // reduced motion: ~2deg nudge
    s.v += dir * KICK;
    s.a = Math.max(-MAX, Math.min(MAX, s.a));
    s.hitAt = performance.now();
    if (reduce) s.hitAt = -1e9;
    if (typeof navigator.vibrate === "function") navigator.vibrate(10);
    if (!s.raf) {
      s.last = performance.now();
      s.raf = requestAnimationFrame(draw);
    }
  };

  return (
    <button type="button" className="globe-bag-btn" aria-label="Hit the bag" onClick={hit}>
      <img ref={imgRef} className="globe-bag" src="/assets/brand/bag-footer.webp" alt="" aria-hidden="true" width="800" height="1200" decoding="async" draggable={false} />
    </button>
  );
}
