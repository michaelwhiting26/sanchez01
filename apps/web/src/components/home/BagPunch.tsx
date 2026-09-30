"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BagEngine } from "@/lib/bag/engine";
import { BAG_PRODUCTS, priceLabel } from "@/lib/bag/products";

type CategoryId = "bags" | "gloves" | "mitts";

interface StillInfo {
  readonly name: string;
  readonly sub: string;
  readonly order: { readonly label: string; readonly href: string };
  readonly build: { readonly label: string; readonly href: string };
  /** The render shown for this category, or null while there is none yet (a marked placeholder is shown instead). */
  readonly image: { readonly src: string; readonly alt: string } | null;
}

/** The product-type bar. Bags are the live 3D bag; the others show a still render (or a marked placeholder until there is one). */
const CATEGORIES: readonly { readonly id: CategoryId; readonly label: string }[] = [
  { id: "bags", label: "Bags" },
  { id: "gloves", label: "Gloves" },
  { id: "mitts", label: "Mitts" },
];

const STILLS: Record<Exclude<CategoryId, "bags">, StillInfo> = {
  gloves: {
    name: "Gloves",
    sub: "PLACEHOLDER: render to come",
    order: { label: "Order gloves", href: "/product" },
    build: { label: "Design gloves", href: "/configure?preset=gloves" },
    image: null,
  },
  mitts: {
    name: "Focus mitts",
    sub: "Render · final colours and materials to be confirmed",
    order: { label: "Order mitts", href: "/product" },
    build: { label: "Build yourself", href: "/configure?preset=mitts" },
    image: { src: "/assets/mitts/mitt_front.png", alt: "A pair of Sanchez focus mitts, orange leather with a green ribbed pocket and the Sanchez logo" },
  },
};

/** The live 3D bag with its product-type bar and switcher. Only Tiger and Monogram bags are live. The canvas is decorative; the controls are real buttons and links. */
export function BagPunch() {
  const rootRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BagEngine | null>(null);
  const [index, setIndex] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [category, setCategory] = useState<CategoryId>("bags");

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
  const isBags = category === "bags";
  const still = isBags ? null : STILLS[category];
  const name = still ? still.name : product.name;
  const sub = still ? still.sub : product.sub;
  const order = still ? still.order : product.order;
  const build = still ? still.build : product.build;
  const catIndex = CATEGORIES.findIndex((c) => c.id === category);

  return (
    <section
      className={`bag-punch${fallback ? " is-fallback" : ""}${isBags ? "" : " is-still"}`}
      data-bag-punch=""
      aria-label="Punch the bag"
      ref={rootRef}
      onKeyDown={(e) => {
        if (!isBags) return;
        if (e.key === "ArrowLeft") {
          engineRef.current?.go(-1);
          e.preventDefault();
        } else if (e.key === "ArrowRight") {
          engineRef.current?.go(1);
          e.preventDefault();
        }
      }}
    >
      <div className="bag-punch__cats" role="tablist" aria-label="Product type" style={{ "--i": catIndex, "--n": CATEGORIES.length } as CSSProperties}>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={c.id === category} onClick={() => setCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="bag-punch__view" data-bag-view="" ref={hostRef} />
      {still && (
        <div className="bag-punch__still" key={category}>
          {still.image ? <img src={still.image.src} alt={still.image.alt} width={1400} height={1000} decoding="async" /> : <p>PLACEHOLDER: {still.name.toLowerCase()} render to come</p>}
        </div>
      )}
      {isBags && (
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
      )}
      <div className="bag-punch__label" aria-live="polite">
        <p className="bag-punch__name">{name}</p>
        <p className="bag-punch__sub">{sub}</p>
        <p className={`bag-punch__price${priceLabel(product.price).placeholder ? " is-placeholder" : ""}`}>{priceLabel(product.price).text}</p>
        {isBags && (
          <div className="bag-punch__dots">
            {BAG_PRODUCTS.map((p, k) => (
              <button key={p.id} type="button" aria-label={p.name} aria-current={k === index} onClick={() => k !== index && engineRef.current?.show(k)} />
            ))}
          </div>
        )}
        <div className="bag-punch__cta">
          <a className="bag-punch__btn" href={order.href}>
            {order.label}
          </a>
          <a className="bag-punch__btn bag-punch__btn--ghost" href={build.href}>
            {build.label}
          </a>
        </div>
        <div className="bag-punch__cta bag-punch__cta--again">
          <a className="bag-punch__btn" href={order.href}>
            Seriously, order the {still ? still.name.toLowerCase() : "bag"}
          </a>
        </div>
      </div>
      {isBags && (
        <p className="bag-punch__hint" aria-hidden="true">
          Drag to spin · click to hit
        </p>
      )}
    </section>
  );
}
