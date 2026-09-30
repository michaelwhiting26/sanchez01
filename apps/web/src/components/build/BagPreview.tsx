"use client";

import { useEffect, useRef, useState } from "react";
import { BagEngine, type FocusPart } from "@/lib/bag/engine";
import { BAG_PRODUCTS, plain, type BagProduct } from "@/lib/bag/products";
import { COLOURS, type BagConfig } from "@/lib/configurator/schema";

const hex = (id: string): number => parseInt((COLOURS.find((c) => c.id === id)?.hex ?? "#ffffff").slice(1), 16);

/** The look of the bag for a config: Tiger and Monogram keep their artwork, a plain bag takes the body and cap colours you chose. */
export function lookFor(cfg: BagConfig): BagProduct {
  if (cfg.preset === "tigerfull") return BAG_PRODUCTS.find((p) => p.id === "tiger") ?? plain("custom", "Your bag", hex(cfg.bodyColour));
  if (cfg.preset === "monogram") return BAG_PRODUCTS.find((p) => p.id === "monogram") ?? plain("custom", "Your bag", hex(cfg.bodyColour));
  return { ...plain("custom", "Your bag", hex(cfg.bodyColour)), trim: hex(cfg.capColour) };
}

/** The interactive 3D bag, always on screen while building: drag to spin, tap to hit it. It follows every choice. */
export function BagPreview({ cfg, focus = "whole" }: { cfg: BagConfig; focus?: FocusPart }) {
  const root = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<BagEngine | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!root.current || !host.current) return undefined;
    try {
      const e = new BagEngine({ root: root.current, host: host.current, onProduct: () => undefined });
      e.setFraming(0.7);
      e.start();
      engine.current = e;
      return () => {
        e.destroy();
        engine.current = null;
      };
    } catch {
      setFallback(true); // no WebGL: a still of the bag instead
      return undefined;
    }
  }, []);

  useEffect(() => {
    engine.current?.preview(lookFor(cfg));
  }, [cfg]);

  useEffect(() => {
    // the engine may still be loading its model: try now and once more shortly (focus needs the model's part boxes)
    engine.current?.focus(focus);
    const t = window.setTimeout(() => engine.current?.focus(focus), 900);
    return () => window.clearTimeout(t);
  }, [focus]);

  return (
    <div className="bd__bag" ref={root}>
      <div className="bd__bag-host" ref={host} />
      {fallback && <img className="bd__bag-still" src="/assets/brand/bag-footer.webp" alt="A Sanchez heavy bag" width={400} height={600} />}

    </div>
  );
}
