"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

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

const PERIOD_S = 16;
const TILT = (-45 * Math.PI) / 180; // ring axis is 45 degrees off the globe's north axis
const FLAT = 0.3; // minor / major: a perspective-flattened circle
const HUG = 1.12; // ring radius as a multiple of the globe radius
const HALF_BTN = 28;
const GUTTER = 8;
const SLOW = 0.12;
const NEAR_PX = 90;
const PARK_T = 0.5; // reduced motion: front-right of the ring

export function OrbitSubmit({ label = "Submit" }: { label?: string }) {
  const { busy, done } = useSyncExternalStore(subscribe, () => state, () => INITIAL);
  const layer = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const host = layer.current;
    const el = btn.current;
    if (!host || !el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let size = host.clientWidth;
    let cx = size / 2; // the globe's centre within the layer, measured from the real globe
    let cy = size / 2;
    let viewW = document.documentElement.clientWidth;
    let t = PARK_T;
    let speed = 1;
    let last = 0;
    let raf = 0;
    let visible = true;
    let hovered = false;
    let pressed = false;
    let focused = false;
    let near = false;
    let interactive = true;
    const cos = Math.cos(TILT);
    const sin = Math.sin(TILT);

    const measureGlobe = (): void => {
      const globe = host.parentElement?.querySelector<HTMLElement>(".footer-globe");
      const hr = host.getBoundingClientRect();
      if (!globe) return;
      const gr = globe.getBoundingClientRect();
      if (gr.width < 10) return;
      size = gr.width;
      cx = gr.left - hr.left + gr.width / 2;
      cy = gr.top - hr.top + gr.height / 2;
    };

    const place = (): void => {
      measureGlobe();
      const r = size / 2;
      let a = r * HUG;
      const b0 = a * FLAT;
      // horizontal half-extent of the rotated ellipse; keep the button inside the viewport with a gutter
      const ext = Math.hypot(a * cos, b0 * sin);
      const slotRect = host.getBoundingClientRect();
      const gcx = slotRect.left + cx;
      const room = Math.min(gcx, viewW - gcx) - HALF_BTN - GUTTER;
      if (ext > room && ext > 0) a *= Math.max(room, 0) / ext;
      const b = a * FLAT;
      const x = a * Math.cos(t);
      const y = b * Math.sin(t);
      const X = x * cos - y * sin;
      const Y = x * sin + y * cos;
      const depth = Math.sin(t); // > 0 is the near half
      const front = depth >= 0;
      const k = (depth + 1) / 2; // 0 far .. 1 near
      const scale = front ? 1 : 0.8 + 0.2 * k * 2;
      el.style.transform = `translate3d(${(cx + X - HALF_BTN).toFixed(1)}px, ${(cy + Y - HALF_BTN).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      el.style.opacity = front ? "1" : (0.55 + 0.45 * k * 2).toFixed(2);
      el.style.zIndex = front ? "3" : "1";
      const want = front;
      if (want !== interactive) {
        interactive = want;
        el.style.pointerEvents = want ? "auto" : "none";
      }
    };

    const frame = (now: number): void => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = hovered || pressed || focused || near ? SLOW : 1;
      speed += (target - speed) * Math.min(1, dt * 8);
      t = (t + ((Math.PI * 2) / PERIOD_S) * speed * dt) % (Math.PI * 2);
      place();
      schedule();
    };
    const schedule = (): void => {
      if (raf || reduce.matches || !visible) return;
      raf = requestAnimationFrame((n) => {
        last = n;
        raf = requestAnimationFrame(frame);
      });
    };
    const stop = (): void => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = (): void => {
      viewW = document.documentElement.clientWidth;
      if (reduce.matches) {
        stop();
        t = PARK_T;
      }
      place();
      schedule();
    };

    const onMove = (e: PointerEvent): void => {
      const r = el.getBoundingClientRect();
      near = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < NEAR_PX;
    };
    const onUp = (): void => {
      pressed = false;
      near = false;
    };
    const on = (k: "hovered" | "pressed" | "focused", v: boolean) => (): void => {
      if (k === "hovered") hovered = v;
      else if (k === "pressed") pressed = v;
      else focused = v;
    };
    const enter = on("hovered", true);
    const leave = on("hovered", false);
    const down = on("pressed", true);
    const focus = on("focused", true);
    const blur = on("focused", false);

    const ro = new ResizeObserver(sync);
    ro.observe(host);
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((en) => en.isIntersecting);
      if (visible) schedule();
      else stop();
    });
    io.observe(host);
    reduce.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    el.addEventListener("focus", focus);
    el.addEventListener("blur", blur);
    sync();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      reduce.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("focus", focus);
      el.removeEventListener("blur", blur);
    };
  }, []);

  return (
    <div className="orbit-layer" ref={layer}>
      <button
        ref={btn}
        className={`orbit-submit${done ? " is-done" : ""}`}
        type="submit"
        form={WAITLIST_FORM_ID}
        aria-label={done ? "You are on the list" : label}
        disabled={busy || done}
      >
        {done ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7" />
            <path d="M8 7 H17 V16" />
          </svg>
        )}
      </button>
    </div>
  );
}
