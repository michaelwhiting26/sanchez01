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
  const buildRef = useRef<HTMLAnchorElement>(null);
  const optionsRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [category, setCategory] = useState<CategoryId | null>("bags"); // the bag shows first; "Choose a product" sits below it (owner, 30 Sep 20:15)

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

  // The sequence: the options band gets its own beat (it fades and rises in once, with a single attention cue on the toggles), and the bag stays completely
  // hidden until ~40% of its view is on screen. Only then is it revealed; the entry spin itself is driven by the bag section's scroll position (engine.ts) and
  // lands the Tiger face-front as before. Scrolling back above the bag hides it again.
  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    const opts = optionsRef.current;
    if (!root || !host || !opts) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ios: IntersectionObserver[] = [];
    if (reduce) {
      opts.classList.add("is-in");
    } else {
      const oi = new IntersectionObserver(
        (en) => {
          if (en.some((e) => e.isIntersecting)) {
            opts.classList.add("is-in"); // once: the cue does not loop
            oi.disconnect();
          }
        },
        { threshold: 0.45 },
      );
      oi.observe(opts);
      ios.push(oi);
    }
    const bi = new IntersectionObserver(
      (en) => {
        const e = en[en.length - 1];
        if (!e) return;
        if (e.intersectionRatio >= 0.4) root.classList.add("is-revealed");
        else if (!e.isIntersecting) root.classList.remove("is-revealed");
      },
      { threshold: [0, 0.4] },
    );
    bi.observe(host);
    ios.push(bi);
    return () => ios.forEach((i) => i.disconnect());
  }, []);

  // "Build yourself" runs away from the cursor (a magnet in reverse) and drifts about on its own. It is meant to be playful, not hostile: the push is gentle
  // and capped, the button settles if the cursor stays on it for a moment or presses down, and touch screens, keyboards and reduced motion never see it move.
  useEffect(() => {
    const el = buildRef.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const RADIUS = 210; // how close the cursor has to get before it backs away
    const PUSH = 95; // the furthest it is ever shoved, px
    let px = -9999;
    let py = -9999;
    let x = 0;
    let y = 0;
    let raf = 0;
    let onScreen = true;
    let overSince = 0;
    let calmUntil = 0;
    const t0 = performance.now();
    const move = (e: PointerEvent): void => {
      px = e.clientX;
      py = e.clientY;
    };
    const leave = (): void => {
      px = -9999;
      py = -9999;
    };
    const press = (): void => {
      calmUntil = performance.now() + 1500; // a press always lands: the button holds still
    };
    const io = new IntersectionObserver((en) => (onScreen = en[0]?.isIntersecting ?? true));
    io.observe(el);
    const frame = (now: number): void => {
      raf = requestAnimationFrame(frame);
      if (!onScreen) return;
      const r = el.getBoundingClientRect();
      const bx = r.left + r.width / 2 - x; // where the button would sit with no offset
      const by = r.top + r.height / 2 - y;
      const inside = px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
      if (inside) overSince ||= now;
      else overSince = 0;
      const mercy = now < calmUntil || (overSince > 0 && now - overSince > 650) ? 0.12 : 1; // cursor rests on it: it lets you have it
      const dx = bx - px;
      const dy = by - py;
      const d = Math.hypot(dx, dy) || 1;
      let tx = 0;
      let ty = 0;
      if (d < RADIUS) {
        const f = 1 - d / RADIUS;
        const push = f * f * PUSH * mercy;
        tx = (dx / d) * push;
        ty = (dy / d) * push;
      }
      const t = (now - t0) / 1000; // a slow idle drift so it always seems to float about
      tx += Math.sin(t * 0.9) * 9;
      ty += Math.cos(t * 0.7) * 7;
      x += (tx - x) * 0.13;
      y += (ty - y) * 0.13;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", press);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", press);
      el.style.transform = "";
    };
  }, []);

  const product = BAG_PRODUCTS[index] ?? BAG_PRODUCTS[0];
  if (!product) return null;
  const chosen = category !== null;
  const isBags = category === "bags";
  const still = category && category !== "bags" ? STILLS[category] : null;
  // picking a product reveals it and carries the visitor down to it (the spiral runs on into the bag)
  const choose = (id: CategoryId): void => {
    setCategory(id);
  };
  const name = still ? still.name : product.name;
  const sub = still ? still.sub : product.sub;
  const order = still ? still.order : product.order;
  const build = still ? still.build : product.build;
  const catIndex = chosen ? CATEGORIES.findIndex((c) => c.id === category) : 0;

  return (
    <>
      <div className="sz-handoff" aria-hidden="true" data-handoff="" />
    <section
      className="bag-punch" /* constant: the engine and the reveal observer add their own classes (is-ready, is-revealed, was-hit), which a changing className would wipe */
      data-fallback={fallback ? "" : undefined}
      data-unchosen={chosen ? undefined : ""}
      data-still={still ? "" : undefined}
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
      <div className="bag-punch__view" data-bag-view="" ref={hostRef} />
      {!chosen && (
        <button type="button" className="bag-punch__pick" onClick={() => document.querySelector(".sz-options")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
          Choose a product below
        </button>
      )}
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
          <a className="bag-punch__btn bag-punch__btn--ghost bag-punch__btn--runs" href={build.href} ref={buildRef}>
            {build.label}
          </a>
        </div>
        <div className="bag-punch__cta bag-punch__cta--again">
          <a className="bag-punch__btn" href={order.href}>
            Seriously, order the {still ? still.name.toLowerCase() : "bag"}
          </a>
        </div>
      </div>
    </section>
      <section className="sz-options" aria-label="Choose a product" ref={optionsRef}>
        <p className="sz-options__label">Choose a product</p>
        <div className="sz-options__rail">
          <div className="bag-punch__cats" role="tablist" aria-label="Product type" data-empty={chosen ? undefined : ""} style={{ "--i": catIndex, "--n": CATEGORIES.length } as CSSProperties}>
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" role="tab" aria-selected={c.id === category} onClick={() => choose(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
