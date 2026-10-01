"use client";

import { useEffect, useRef } from "react";
import { subscribe } from "@/lib/frame";

/**
 * Two thin pieces of page chrome on the homepage, both driven by the one clock (lib/frame.ts), both transform/opacity only:
 *  - a 3 px gold scroll-progress bar along the top (scaleX = scroll progress), hidden while the DNA dive fills the screen;
 *  - a gold cursor ring for mouse/trackpad users ((pointer: fine) and no reduced-motion preference) that eases after the pointer, grows over buttons,
 *    links and pills, and hides over form fields and the dive's iframe. The native cursor always stays: the ring only follows it.
 */
const INTERACTIVE = "a[href], button, [role='tab'], [role='button'], label, summary, .sz-options button";
const NATIVE_ONLY = "input, textarea, select, [contenteditable=''], [contenteditable='true'], iframe";
const FOLLOW = 22; // 1/s: how quickly the ring catches the pointer (frame-rate independent)

export function ScrollChrome() {
  const bar = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  // progress bar
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    let dive: Element | null = null;
    let hidden = false;
    let last = -1;
    const offRead = subscribe("read", (_t, _dt, s) => {
      dive ??= document.querySelector(".dna-dive");
      if (!s.changed && last >= 0) return;
      const r = dive?.getBoundingClientRect();
      hidden = !!r && r.top <= 0 && r.bottom >= window.innerHeight; // the dive's stage is pinned: the ride owns the screen
    });
    const offWrite = subscribe("write", (_t, _dt, s) => {
      if (Math.abs(s.progress - last) < 0.0005 && el.classList.contains("is-hidden") === hidden) return;
      last = s.progress;
      el.style.transform = `scaleX(${s.progress.toFixed(4)})`;
      el.classList.toggle("is-hidden", hidden);
    });
    return () => {
      offRead();
      offWrite();
    };
  }, []);

  // cursor ring
  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    let off: (() => void) | null = null;
    let px = 0, py = 0, x = 0, y = 0, seen = false, hover = false, show = false;
    const onMove = (e: PointerEvent): void => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      px = e.clientX;
      py = e.clientY;
      if (!seen) {
        seen = true;
        x = px;
        y = py;
      }
      const t = e.target instanceof Element ? e.target : null;
      show = !t?.closest(NATIVE_ONLY);
      hover = !!t?.closest(INTERACTIVE);
    };
    const onLeave = (): void => {
      show = false;
    };
    const enable = (): void => {
      if (off || !mq.matches) return;
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      off = subscribe("write", (_t, dt) => {
        const k = 1 - Math.exp((-FOLLOW * dt) / 1000);
        x += (px - x) * k;
        y += (py - y) * k;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.classList.toggle("is-on", seen && show);
        el.classList.toggle("is-hover", hover);
      });
    };
    const disable = (): void => {
      off?.();
      off = null;
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      el.classList.remove("is-on", "is-hover");
      seen = false;
    };
    const sync = (): void => (mq.matches ? enable() : disable());
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      disable();
    };
  }, []);

  return (
    <>
      <div ref={bar} className="scroll-progress" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
