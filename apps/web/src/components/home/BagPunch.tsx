"use client";

import { useEffect, useRef, useState } from "react";
import { BagEngine } from "@/lib/bag/engine";
import { BAG_PRODUCTS, priceLabel } from "@/lib/bag/products";

/** The live 3D bag with its product switcher. Only Tiger and Monogram are live. The canvas is decorative; the switcher is real buttons and links. */
export function BagPunch() {
  const rootRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BagEngine | null>(null);
  const [index, setIndex] = useState(0);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;
    let engine: BagEngine;
    try {
      engine = new BagEngine({ root, host, onProduct: setIndex });
    } catch {
      setFallback(true); // no WebGL: the switcher still works as plain links
      return;
    }
    engineRef.current = engine;
    engine.start();
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const product = BAG_PRODUCTS[index] ?? BAG_PRODUCTS[0];
  if (!product) return null;

  return (
    <section
      className={`bag-punch${fallback ? " is-fallback" : ""}`}
      data-bag-punch=""
      aria-label="Punch the bag"
      ref={rootRef}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          engineRef.current?.go(-1);
          e.preventDefault();
        } else if (e.key === "ArrowRight") {
          engineRef.current?.go(1);
          e.preventDefault();
        }
      }}
    >
      <div className="bag-punch__view" data-bag-view="" ref={hostRef} />
      <div className="bag-punch__switch" role="group" aria-label="Choose a product">
        <button className="bag-punch__arrow bag-punch__arrow--prev" type="button" aria-label="Previous product" onClick={() => engineRef.current?.go(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.5 5.5 8 12l6.5 6.5" />
          </svg>
        </button>
        <button className="bag-punch__arrow bag-punch__arrow--next" type="button" aria-label="Next product" onClick={() => engineRef.current?.go(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.5 5.5 16 12l-6.5 6.5" />
          </svg>
        </button>
      </div>
      <div className="bag-punch__label" aria-live="polite">
        <p className="bag-punch__name">{product.name}</p>
        <p className="bag-punch__sub">{product.sub}</p>
        <p className={`bag-punch__price${priceLabel(product.price).placeholder ? " is-placeholder" : ""}`}>{priceLabel(product.price).text}</p>
        <div className="bag-punch__dots">
          {BAG_PRODUCTS.map((p, k) => (
            <button key={p.id} type="button" aria-label={p.name} aria-current={k === index} onClick={() => k !== index && engineRef.current?.show(k)} />
          ))}
        </div>
        <div className="bag-punch__cta">
          <a className="bag-punch__btn" href={product.order.href}>
            {product.order.label}
          </a>
          <a className="bag-punch__btn bag-punch__btn--ghost" href={product.build.href}>
            {product.build.label}
          </a>
        </div>
      </div>
      <p className="bag-punch__hint" aria-hidden="true">
        Drag to spin · click to hit
      </p>
    </section>
  );
}
