"use client";

import { useEffect, useRef } from "react";
import { HeroEngine } from "@/lib/hero/engine";

/**
 * Mounts the hero field engine on a fixed canvas behind the whole page. The engine is framework-free; this component only owns its lifecycle
 * (start on mount, destroy on unmount) so it is safe under React Strict Mode and route changes.
 */
export function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>("[data-hero-rings]");
    if (!canvas || !hero) return;
    let engine: HeroEngine;
    try {
      engine = new HeroEngine({
        canvas,
        hero,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        coarsePointer: window.matchMedia("(pointer: coarse)").matches,
      });
    } catch {
      hero.classList.add("is-static"); // no canvas: the plain wordmark and "Custom" stand in for the field
      return;
    }
    void engine.start().catch(() => hero.classList.add("is-static"));
    if (process.env.NODE_ENV !== "production") (window as Window & { __hero?: HeroEngine }).__hero = engine;
    return () => engine.destroy();
  }, []);

  return <canvas ref={canvasRef} className="wm-field" aria-hidden="true" />;
}
