"use client";

import { useEffect, useImperativeHandle, useRef, useState, type PointerEvent as RPointerEvent, type Ref, type WheelEvent as RWheelEvent } from "react";
import { BagEngine, type BuildOptions, type FocusPart, type SceneId } from "@/lib/bag/engine";
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

/** What the sheet can ask of the preview: a finished picture (photo + bag + wordmark) as a canvas. */
export interface BagHandle {
  snapshot: () => HTMLCanvasElement | null;
}

interface Xf { x: number; y: number; s: number }
const IDENTITY: Xf = { x: 0, y: 0, s: 1 };
const clampScale = (s: number): number => Math.min(5, Math.max(0.5, s));

/** The interactive 3D bag, always on screen while building: drag to spin, tap to hit it. It follows every choice. */
export function BagPreview({ cfg, focus = "whole", scene = "studio", photo = null, adjust = false, ref }: { cfg: BagConfig; focus?: FocusPart; scene?: SceneId; photo?: string | null; adjust?: boolean; ref?: Ref<BagHandle> }) {
  const root = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<BagEngine | null>(null);
  const [fallback, setFallback] = useState(false);
  const [xf, setXf] = useState<Xf>(IDENTITY);
  const img = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const xfRef = useRef(xf);
  xfRef.current = xf;
  const showPhoto = scene === "room" && photo !== null;

  useImperativeHandle(ref, () => ({
    snapshot: (): HTMLCanvasElement | null => {
      const e = engine.current;
      const r = root.current;
      if (!e || !r) return null;
      const w = r.clientWidth;
      const h = r.clientHeight;
      if (!w || !h) return null;
      const dpr = window.devicePixelRatio || 1;
      const out = document.createElement("canvas");
      out.width = Math.round(w * dpr);
      out.height = Math.round(h * dpr);
      const ctx = out.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#07080a";
      ctx.fillRect(0, 0, out.width, out.height);
      const el = img.current;
      if (showPhoto && el && el.naturalWidth) {
        const base = Math.max(w / el.naturalWidth, h / el.naturalHeight);
        const dw = el.naturalWidth * base;
        const dh = el.naturalHeight * base;
        const t = xfRef.current;
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.translate(w / 2 + t.x, h / 2 + t.y);
        ctx.scale(t.s, t.s);
        ctx.drawImage(el, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }
      ctx.drawImage(e.capture(), 0, 0, out.width, out.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "rgba(243,234,220,.8)";
      ctx.font = "700 13px sans-serif";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("S A N C H E Z", 16, h - 16);
      ctx.restore();
      return out;
    },
  }), [showPhoto]);

  useEffect(() => {
    if (!root.current || !host.current) return undefined;
    try {
      const e = new BagEngine({ root: root.current, host: host.current, onProduct: () => undefined });
      e.setFraming(1.0);
      e.start();
      e.setScene(sceneRef.current);
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
    engine.current?.setScene(scene);
  }, [scene]);

  useEffect(() => {
    setXf(IDENTITY); // a new photo starts centred
  }, [photo]);

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

  const down = (e: RPointerEvent<HTMLDivElement>): void => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const move = (e: RPointerEvent<HTMLDivElement>): void => {
    const map = pointers.current;
    const prev = map.get(e.pointerId);
    if (!prev) return;
    if (map.size === 1) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      setXf((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
    } else if (map.size === 2) {
      const other = [...map.entries()].find(([id]) => id !== e.pointerId)?.[1];
      if (other) {
        const before = Math.hypot(prev.x - other.x, prev.y - other.y);
        const after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
        if (before > 0) setXf((t) => ({ ...t, s: clampScale(t.s * (after / before)) }));
      }
    }
    map.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const up = (e: RPointerEvent<HTMLDivElement>): void => {
    pointers.current.delete(e.pointerId);
  };
  const wheel = (e: RWheelEvent<HTMLDivElement>): void => {
    const f = Math.exp(-e.deltaY * 0.0025);
    setXf((t) => ({ ...t, s: clampScale(t.s * f) }));
  };

  return (
    <div className="bd__bag" ref={root}>
      {scene === "room" && (showPhoto
        ? <img ref={img} className="bd__photo" src={photo} alt="" draggable={false} style={{ transform: `translate(${xf.x}px, ${xf.y}px) scale(${xf.s})` }} />
        : <div className="bd__photo-empty" aria-hidden="true" />)}
      <div className="bd__bag-host" ref={host} />
      {showPhoto && adjust && <div className="bd__adjust" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel} />}
      <p className="bd__size" aria-live="polite">{cfg.sizeFt} ft · {Math.round(cfg.sizeFt * 30.48)} cm</p>
      {fallback && <img className="bd__bag-still" src="/assets/brand/bag-footer.webp" alt="A Sanchez heavy bag" width={400} height={600} />}

    </div>
  );
}
