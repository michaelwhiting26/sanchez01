"use client";

import { useEffect, useRef, useState } from "react";
import { BagEngine, type BuildOptions, type FocusPart } from "@/lib/bag/engine";
import { BAG_PRODUCTS, plain, type BagProduct } from "@/lib/bag/products";
import { COLOURS, type BagConfig } from "@/lib/configurator/schema";

const hex = (id: string): number => parseInt((COLOURS.find((c) => c.id === id)?.hex ?? "#ffffff").slice(1), 16);

/** The look of the bag for a config: Tiger and Monogram keep their artwork, a plain bag takes the body and cap colours you chose. */
export function lookFor(cfg: BagConfig): BagProduct {
  if (cfg.preset === "tigerfull") return BAG_PRODUCTS.find((p) => p.id === "tiger") ?? plain("custom", "Your bag", hex(cfg.bodyColour));
  if (cfg.preset === "monogram") return BAG_PRODUCTS.find((p) => p.id === "monogram") ?? plain("custom", "Your bag", hex(cfg.bodyColour));
  return { ...plain("custom", "Your bag", hex(cfg.bodyColour)), trim: hex(cfg.capColour), trimBottom: hex(cfg.bottomColour) };
}

/** Everything the builder has chosen, in the terms the 3D bag understands. */
export function optionsFor(cfg: BagConfig): BuildOptions {
  return {
    plain: cfg.preset === "plain",
    sizeFt: cfg.sizeFt,
    hardware: cfg.hardware,
    hanging: cfg.hanging,
    stitching: cfg.stitching,
    material: cfg.material,
    layout: cfg.panelLayout,
    bodyHex: hex(cfg.bodyColour),
    accentHex: hex(cfg.accentColour),
    bottomHex: hex(cfg.bottomColour),
    logoSize: cfg.logoSize,
    makersMark: cfg.makersMark,
    anchorRing: cfg.anchorRing,
    piping: cfg.piping,
    text: cfg.extraText,
    font: cfg.font,
  };
}

/** The interactive 3D bag, always on screen while building: drag to spin, tap to hit it. It follows every choice. */
export function BagPreview({ cfg, focus = "whole" }: { cfg: BagConfig; focus?: FocusPart }) {
  const root = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<BagEngine | null>(null);
  const [fallback, setFallback] = useState(false);
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  useEffect(() => {
    if (!root.current || !host.current) return undefined;
    try {
      const e = new BagEngine({ root: root.current, host: host.current, onProduct: () => undefined });
      e.setFraming(1.0);
      e.start();
      e.build(optionsFor(cfgRef.current));
      engine.current = e;
      if (process.env.NODE_ENV !== "production") (window as Window & { __bag?: BagEngine }).__bag = e;
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
    engine.current?.build(optionsFor(cfg));
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
      <p className="bd__size" aria-live="polite">{cfg.sizeFt} ft · {Math.round(cfg.sizeFt * 30.48)} cm</p>
      {fallback && <img className="bd__bag-still" src="/assets/brand/bag-footer.webp" alt="A Sanchez heavy bag" width={400} height={600} />}

    </div>
  );
}
