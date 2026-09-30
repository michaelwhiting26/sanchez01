"use client";

import { useEffect, useRef } from "react";
import { DnaCore as Engine } from "@/lib/dna";

/** The fixed double helix behind the page. Purely decorative. */
export function DnaCore() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dna = new Engine(canvas, {
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    });
    dna.start();
    return () => dna.destroy();
  }, []);
  return <canvas ref={ref} className="dna-core" aria-hidden="true" />;
}
