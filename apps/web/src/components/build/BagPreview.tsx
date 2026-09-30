"use client";

import { useEffect, useRef, useState } from "react";
import { BagEngine } from "@/lib/bag/engine";
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
export function BagPreview({ cfg, caption }: { cfg: BagConfig; caption: string }) {
  const root = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<BagEngine | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!root.current || !host.current) return undefined;
    try {
      const e = new BagEngine({ root: root.current, host: host.current, onProduct: () => undefined });
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

  return (
    <div className="bd__bag" ref={root}>
      <div className="bd__bag-host" ref={host} />
      {fallback && <img className="bd__bag-still" src="/assets/brand/bag-footer.webp" alt="A Sanchez heavy bag" width={400} height={600} />}
      <p className="bd__caption">{caption}</p>
      <p className="bd__bag-hint" aria-hidden="true">Drag to spin · tap to hit</p>
    </div>
  );
}
