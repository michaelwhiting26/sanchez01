"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { setScrollProvider, subscribe } from "@/lib/frame";
import { registerSz } from "@/lib/e2e-hooks";
import { attach, scrollTo } from "@/lib/scroll";

/**
 * The page's scroll engine, mounted once in app/layout.tsx. Lenis smooths wheel and trackpad input and moves the REAL scroll position every frame
 * (no transforms on the content: sticky, IntersectionObserver, find-in-page, anchors and the scrollbar keep working). Touch stays native.
 * It is advanced by lib/frame.ts (autoRaf: false), so the scroll and everything that reads it share one clock.
 * Reduced-motion visitors get no Lenis at all: native scrolling, and lib/frame.ts reads the browser's own position.
 */
/**
 * Elements that scroll on their own: wheel/touch over them scrolls them, never the page. Homepage code marks its own with `data-lenis-prevent`;
 * the shared drawer/modal bodies and the build flow's sheets are listed here, so their owners' components need no Lenis knowledge.
 */
const INNER_SCROLLERS = "[data-lenis-prevent], .drawer__body, .modal__body, .ck__sheet, .ck__list, .shs__panel, .pgl-text";

export function SmoothScroll(): null {
  useEffect(() => registerSz("scroll", { to: (target, opts) => scrollTo(target, opts) }), []);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false, // touch stays the browser's own
      autoRaf: false, // lib/frame.ts drives it
      prevent: (node) => node.matches(INNER_SCROLLERS),
    });
    attach(lenis);
    const restore = setScrollProvider({
      advance: (t) => lenis.raf(t),
      read(out) {
        // while Lenis animates, its sub-pixel position; otherwise the browser's own (a scrollbar drag, a key, a test's scrollTo moves the page before
        // Lenis hears the scroll event, and that frame must not draw at the old position)
        out.y = lenis.isScrolling === "smooth" ? lenis.scroll : window.scrollY;
        out.limit = lenis.limit;
      },
    });
    // keeps the clock (and so Lenis) running while the page is open; the work is in the provider above
    const off = subscribe("scroll", () => undefined);
    return () => {
      off();
      restore();
      attach(null);
      lenis.destroy();
    };
  }, []);
  return null;
}
