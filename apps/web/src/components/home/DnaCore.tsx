"use client";

import { useEffect, useRef } from "react";
import { DnaCore as Engine } from "@/lib/dna";
import { registerSz } from "@/lib/e2e-hooks";

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
    const off = registerSz("spiral", { drawAt: () => dna.drawAt() });
    return () => {
      off();
      dna.destroy();
    };
  }, []);
  return <canvas ref={ref} className="dna-core" aria-hidden="true" />;
}
