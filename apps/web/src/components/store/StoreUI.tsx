"use client";

import type { StoreBootstrap, StoreProduct } from "@/lib/storefront/types";
import type { StoreEventObject, StoreStage } from "@/experience/store-machine";

export function formatPrice(product: StoreProduct): string {
  if (product.priceFromMinor === null) return "Price to come";
  return `From ${new Intl.NumberFormat("en-AU", { style: "currency", currency: product.currency, maximumFractionDigits: 0 }).format(product.priceFromMinor / 100)}`;
}

interface Props {
  readonly bootstrap: StoreBootstrap;
  readonly stage: StoreStage;
  readonly index: number;
  readonly caption: string | null;
  readonly audioEnabled: boolean;
  readonly canEnter: boolean;
  /** True on iPhones until the visitor has allowed the motion sensor: shows the one-tap control that asks for it. */
  readonly tiltPrompt: boolean;
  readonly send: (event: StoreEventObject) => void;
  readonly onEnter: () => void;
  readonly onSkipGreeting: () => void;
  readonly onToggleAudio: () => void;
  readonly onEnableTilt: () => void;
  readonly onDesign: () => void;
}

/** Everything drawn over the 3D world. Kept to a small share of the screen: the room is the interface (spec Part 4: 80 to 90% world). */
export function StoreUI({ bootstrap, stage, index, caption, audioEnabled, canEnter, tiltPrompt, send, onEnter, onSkipGreeting, onToggleAudio, onEnableTilt, onDesign }: Props) {
  const products = bootstrap.products;
  const product = products[index];
  const outside = stage === "boot" || stage === "arrive";
  return (
    <div className="store-ui" data-stage={stage}>
      <header className={`store-ui__brand${stage === "boot" ? "" : outside ? " is-hidden" : " is-small"}`}>
        <p className="store-ui__wordmark">Sanchez</p>
        <p className="store-ui__sub">Custom Boxing</p>
      </header>

      {stage !== "boot" && stage !== "arrive" ? (
        <button type="button" className="store-ui__sound" onClick={onToggleAudio} aria-pressed={audioEnabled}>
          {audioEnabled ? "Sound on" : "Sound off"}
        </button>
      ) : null}

      {stage === "arrive" && tiltPrompt ? (
        <button type="button" className="store-ui__sound" onClick={onEnableTilt}>
          Tilt to look
        </button>
      ) : null}

      {outside ? (
        <button type="button" className="store-ui__door" onClick={onEnter} disabled={!canEnter} aria-label="Enter the Sanchez workshop">
          <span className="store-ui__enter">{canEnter ? "Tap to enter" : "Opening up"}</span>
        </button>
      ) : null}

      {stage === "greeting" ? (
        <>
          <p className="store-ui__caption" aria-live="polite">
            {caption}
          </p>
          <button type="button" className="store-ui__skip" onClick={onSkipGreeting}>
            Skip
          </button>
        </>
      ) : null}

      {(stage === "browsing" || stage === "productSelected" || stage === "builderLoading") && product ? (
        <section className="store-ui__product" aria-live="polite">
          <p className="store-ui__count">
            {index + 1} / {products.length}
          </p>
          <h1 className="store-ui__name">{product.name}</h1>
          <p className="store-ui__tagline">{product.tagline}</p>
          <p className="store-ui__price">{formatPrice(product)}</p>
          {product.standIn ? <p className="store-ui__note">Stand-in shape. The real model is to come.</p> : null}
          <div className="store-ui__actions">
            {stage === "browsing" ? (
              <button type="button" className="pg__btn" onClick={() => send({ type: "SELECT_PRODUCT", productId: product.id, index })}>
                Design it
              </button>
            ) : (
              <>
                <button type="button" className="pg__btn" onClick={onDesign} disabled={stage === "builderLoading"}>
                  {stage === "builderLoading" ? "Opening" : "Design this"}
                </button>
                <button type="button" className="store-ui__back" onClick={() => send({ type: "BACK" })} disabled={stage === "builderLoading"}>
                  Back
                </button>
              </>
            )}
          </div>
          {stage === "browsing" ? (
            <nav className="store-ui__dots" aria-label="Products">
              <button type="button" className="store-ui__arrow" onClick={() => send({ type: "PREV_PRODUCT" })} disabled={index === 0} aria-label="Previous product">
                ‹
              </button>
              {products.map((p, i) => (
                <button key={p.id} type="button" className={`store-ui__dot${i === index ? " is-on" : ""}`} onClick={() => send({ type: "GO_TO_PRODUCT", index: i })} aria-label={p.name} aria-current={i === index} />
              ))}
              <button type="button" className="store-ui__arrow" onClick={() => send({ type: "NEXT_PRODUCT" })} disabled={index === products.length - 1} aria-label="Next product">
                ›
              </button>
            </nav>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
