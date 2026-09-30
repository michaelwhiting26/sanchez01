"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { RollingContent } from "@/components/ui/RollingButton";

/** The waitlist form's id: the orbiting button lives outside the form (in the globe slot) and submits it through the `form` attribute. */
export const WAITLIST_FORM_ID = "waitlist-form";

type OrbitState = { readonly busy: boolean; readonly done: boolean };
const INITIAL: OrbitState = { busy: false, done: false };

/* A tiny external store: <Waitlist> and <OrbitSubmit> are siblings under a server component, so state is shared here rather than by a context. */
let state: OrbitState = INITIAL;
const listeners = new Set<() => void>();
export function publishWaitlistState(next: OrbitState): void {
  if (next.busy === state.busy && next.done === state.done) return;
  state = next;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => void listeners.delete(l);
}

// Tethered Submit: a wide Submit bar floats just above the globe, held in place by the globe's pull (no visible line: owner, 30 Sep 19:25).
// It bobs and leans a little on its own, is drawn towards the cursor when the pointer comes close, and always springs back to the globe.
const GAP = 64; // px from the globe's top edge to the bar's bottom when at rest
const TILT_DEG = -9; // the bar's resting lean (from the sketch: rising to the right)
const PULL = 0.28; // how far it follows the cursor (fraction of the distance), capped below
const MAX_PULL = 36;

export function OrbitSubmit({ label = "Submit" }: { label?: string }) {
  const { busy, done } = useSyncExternalStore(subscribe, () => state, () => INITIAL);
  const layer = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const host = layer.current;
    const el = btn.current;
    if (!host || !el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let top = { x: 0, y: 0 }; // the globe's top point, in layer coordinates
    let px = -1e9;
    let py = -1e9;
    let ox = 0; // the bar's offset from rest (springs)
    let oy = 0;
    let vx = 0;
    let vy = 0;
    let raf = 0;
    let visible = true;
    const t0 = performance.now();

    const measure = (): void => {
      const globe = host.parentElement?.querySelector<HTMLElement>(".footer-globe");
      if (!globe) return;
      const hr = host.getBoundingClientRect();
      const gr = globe.getBoundingClientRect();
      if (gr.width < 10) return;
      top = { x: gr.left - hr.left + gr.width / 2, y: gr.top - hr.top + gr.height * 0.03 };
    };

    const place = (now: number, dt: number): void => {
      measure();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const t = reduce.matches ? 0 : (now - t0) / 1000;
      // rest: centred over the globe's top, a little off-centre, leaning like the sketch
      const restX = top.x - w * 0.06;
      const restY = top.y - GAP - h / 2;
      // cursor attraction, capped; otherwise zero
      let tx = 0;
      let ty = 0;
      const hr = host.getBoundingClientRect();
      const dx = px - hr.left - restX;
      const dy = py - hr.top - restY;
      const d = Math.hypot(dx, dy);
      if (!reduce.matches && d < 220) {
        const k = Math.min(MAX_PULL, d * PULL) / (d || 1);
        tx = dx * k;
        ty = dy * k;
      }
      // spring towards the target (the globe's pull brings it home)
      if (reduce.matches) {
        ox = tx;
        oy = ty;
      } else {
        vx += ((tx - ox) * 90 - vx * 11) * dt;
        vy += ((ty - oy) * 90 - vy * 11) * dt;
        ox += vx * dt;
        oy += vy * dt;
      }
      const bob = Math.sin(t * 1.3) * 5;
      const sway = Math.sin(t * 0.8) * 2.5;
      const cx = restX + ox + sway;
      const cy = restY + oy + bob;
      const lean = TILT_DEG + Math.sin(t * 0.9) * 2 + ox * 0.08;
      el.style.transform = `translate3d(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px, 0) rotate(${lean.toFixed(2)}deg)`;
    };

    let last = performance.now();
    const frame = (now: number): void => {
      raf = 0;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      place(now, dt);
      if (visible && !reduce.matches) raf = requestAnimationFrame(frame);
    };
    const kick = (): void => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onMove = (e: PointerEvent): void => {
      if (e.pointerType !== "mouse") return; // touch: no chasing, it just floats
      px = e.clientX;
      py = e.clientY;
    };
    const onLeave = (): void => {
      px = -1e9;
      py = -1e9;
    };
    const ro = new ResizeObserver(kick);
    ro.observe(host);
    const io = new IntersectionObserver((en) => {
      visible = en.some((x) => x.isIntersecting);
      if (visible) kick();
    });
    io.observe(host);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", kick);
    reduce.addEventListener("change", kick);
    kick();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", kick);
      reduce.removeEventListener("change", kick);
    };
  }, []);

  return (
    <div className="orbit-layer" ref={layer}>
      <button ref={btn} className={`orbit-submit${done ? " is-done" : ""}`} type="submit" form={WAITLIST_FORM_ID} disabled={busy || done} aria-label={done ? "You're on the list" : label}>
        {done ? (
          <>
            <span>You&apos;re on the list</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </>
        ) : (
          <RollingContent label={label} /> /* hover: each letter rolls up and is replaced from below, the arrow sends (the mr-2 tumble) */
        )}
      </button>
    </div>
  );
}
