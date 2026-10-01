/**
 * The application's only interface to page scrolling. Components never import Lenis; they call these.
 *
 *  - scrollTo(target, opts): smooth (Lenis) or native; `immediate` jumps (position restore). Where an element lands is set by CSS, once:
 *    html's scroll-padding-block-start (base.css: room for the fixed header), honoured by Lenis and by native anchors alike. `offset` adds to it.
 *  - stop(key) / start(key): page scroll lock for modals. Keyed, so overlapping modals never unlock each other: the page stays locked until EVERY key that
 *    stopped it has started it again. Works with and without Lenis (reduced motion, no JS smoothing): the lock is also a class on <html>.
 *
 * SmoothScroll.tsx attaches the Lenis instance with `attach()`. Until then (and for reduced-motion visitors, who never get Lenis) everything is native.
 */
import type Lenis from "lenis";

export type ScrollTarget = number | string | HTMLElement;
export interface ScrollToOptions {
  /** Added to the target position (px), on top of html's scroll-padding (which already keeps sections clear of the fixed header). Default 0. */
  offset?: number;
  /** "start" (default): the element's top lands at html's scroll-padding. "center": the element is centred in the viewport (scroll-padding ignored). */
  align?: "start" | "center";
  /** Jump with no animation (restoring a position). */
  immediate?: boolean;
  /** Seconds, for a Lenis eased scroll; default: Lenis' own lerp. */
  duration?: number;
}

const LOCK_CLASS = "is-scroll-locked";
let lenis: Lenis | null = null;
const locks = new Set<string>();

/** SmoothScroll.tsx: hand over the Lenis instance (null on teardown). */
export function attach(instance: Lenis | null): void {
  lenis = instance;
  if (lenis && locks.size > 0) lenis.stop();
}

/** html's scroll-padding-block-start in px: how far below the top a scrolled-to element lands (Lenis applies it itself; the native path here). */
function scrollPadding(): number {
  return parseFloat(getComputedStyle(document.documentElement).scrollPaddingBlockStart) || 0;
}

const reducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function scrollTo(target: ScrollTarget, opts: ScrollToOptions = {}): void {
  let offset = opts.offset ?? 0;
  if (opts.align === "center" && typeof target !== "number") {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    // Lenis (and the native path below) land the top at scroll-padding: undo that, then centre
    offset += scrollPadding() - (window.innerHeight - el.getBoundingClientRect().height) / 2;
  }
  if (lenis) {
    // force: run even while another lock is easing out; lock-free otherwise
    const lo: Parameters<Lenis["scrollTo"]>[1] = { offset, immediate: opts.immediate === true, force: true };
    if (opts.duration !== undefined) lo.duration = opts.duration;
    lenis.scrollTo(target, lo);
    return;
  }
  let top: number;
  if (typeof target === "number") top = target;
  else {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    top = el.getBoundingClientRect().top + window.scrollY - scrollPadding();
  }
  window.scrollTo({ top: Math.max(0, top + offset), left: 0, behavior: opts.immediate || reducedMotion() ? "instant" : "smooth" });
}

/** Lock page scrolling for `key` (a modal's id). Idempotent per key. */
export function stop(key = "default"): void {
  locks.add(key);
  document.documentElement.classList.add(LOCK_CLASS);
  lenis?.stop();
}

/** Release `key`'s lock; the page scrolls again only when no key holds it. */
export function start(key = "default"): void {
  locks.delete(key);
  if (locks.size > 0) return;
  document.documentElement.classList.remove(LOCK_CLASS);
  lenis?.start();
}

export const isLocked = (): boolean => locks.size > 0;
