"use client";

import { useEffect } from "react";
import type Lenis from "lenis";

/**
 * The home page's motion (owner, 15 Oct 2026: "sleek", with the smooth, scroll-linked feel of the first scroll site).
 * Lenis smooth scroll plus GSAP ScrollTrigger: sections rise in as they arrive ([data-reveal], [data-reveal-stagger]),
 * films drift slightly against the scroll ([data-parallax]) and the opening film settles in ([data-hero-zoom]).
 * Loaded after first paint so it never delays the page; switched off entirely for visitors who ask for reduced motion.
 */
export function Motion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lenis: Lenis | null = null;
    let raf = 0;
    let stopped = false;
    let revert: (() => void) | null = null;
    void (async () => {
      const [{ default: LenisCtor }, { gsap }, { ScrollTrigger }] = await Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]);
      if (stopped) return;
      gsap.registerPlugin(ScrollTrigger);
      lenis = new LenisCtor({ lerp: 0.11, smoothWheel: true });
      lenis.on("scroll", () => ScrollTrigger.update());
      const tick = (t: number): void => {
        lenis?.raf(t);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      const ctx = gsap.context(() => {
        for (const el of gsap.utils.toArray<HTMLElement>("[data-reveal]")) {
          gsap.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 97%", once: true } });
        }
        for (const wrap of gsap.utils.toArray<HTMLElement>("[data-reveal-stagger]")) {
          gsap.fromTo(Array.from(wrap.children), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: wrap, start: "top 95%", once: true } });
        }
        for (const el of gsap.utils.toArray<HTMLElement>("[data-parallax]")) {
          gsap.fromTo(el, { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true } });
        }
        const hero = document.querySelector<HTMLElement>("[data-hero-zoom]");
        if (hero) gsap.fromTo(hero, { scale: 1.08 }, { scale: 1, duration: 2.6, ease: "power2.out" });
      });
      revert = () => ctx.revert();
    })();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
      revert?.();
    };
  }, []);
  return null;
}
