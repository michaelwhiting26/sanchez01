"use client";

import type { CollectionPiece, StoreBootstrap, StoreProduct, WallStory } from "@/lib/storefront/types";
import type { StoreEventObject, StoreStage } from "@/experience/store-machine";

export function formatPrice(product: StoreProduct): string {
  if (product.priceFromMinor === null) return "Price to come";
  return `From ${new Intl.NumberFormat("en-AU", { style: "currency", currency: product.currency, maximumFractionDigits: 0 }).format(product.priceFromMinor / 100)}`;
}

/** A collection piece's price line: its price, "Sold out", or an honest "Price to come". */
export function piecePrice(piece: CollectionPiece): string {
  if (piece.soldOut) return "Sold out";
  if (piece.priceMinor === null) return "Price to come";
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: piece.currency, maximumFractionDigits: 0 }).format(piece.priceMinor / 100);
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
  /** True once Jesse has started speaking: the answers appear while he talks, not after. */
  readonly choicesOpen: boolean;
  /** The wall story the visitor has opened, if any. */
  readonly story: WallStory | null;
  readonly onChoose: (choice: number | "all" | "look") => void;
  readonly onLookAround: () => void;
  readonly onOpenStory: (id: string) => void;
  readonly onCloseStory: () => void;
  readonly collectionOpen: boolean;
  readonly onCloseCollection: () => void;
  readonly onDesign: () => void;
}

/** Everything drawn over the 3D world. Kept to a small share of the screen: the room is the interface (spec Part 4: 80 to 90% world). */
export function StoreUI(props: Props) {
  const { bootstrap, stage, index, caption, audioEnabled, canEnter, tiltPrompt, send, onEnter, onToggleAudio, onEnableTilt, onDesign } = props;
  const { choicesOpen, story, onChoose, onLookAround, onOpenStory, onCloseStory, collectionOpen, onCloseCollection } = props;
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
        <div className="store-ui__greet">
          <p className="store-ui__caption" aria-live="polite">
            {caption}
          </p>
          {/* He asks, the visitor answers: straight to the gear, or the optional look around (owner, 6 Oct 2026: one button, not one per product). */}
          <nav className={`store-ui__choices${choicesOpen ? " is-open" : ""}`} aria-label="What are you here for?">
            <button type="button" className="store-ui__choice store-ui__choice--main" data-choice="all" onClick={() => onChoose("all")} tabIndex={choicesOpen ? 0 : -1}>
              Customise gear
            </button>
            <button type="button" className="store-ui__choice store-ui__choice--quiet" data-choice="look" onClick={() => onChoose("look")} tabIndex={choicesOpen ? 0 : -1}>
              View collection
            </button>
          </nav>
        </div>
      ) : null}

      {stage === "lookingAround" ? (
        <div className="store-ui__greet">
          <p className="store-ui__caption" aria-live="polite">
            {caption}
          </p>
          {/* The wall view: open the full collection, or go back. (The workshop film's button was removed by the owner, 6 Oct 2026.) */}
          <nav className="store-ui__choices is-open" aria-label="On the wall">
            <button type="button" className="store-ui__choice store-ui__choice--main" data-choice="collection" onClick={() => onOpenStory("collection")}>
              See every piece
            </button>
            <button type="button" className="store-ui__choice store-ui__choice--quiet" data-choice="back" onClick={() => send({ type: "BACK" })}>
              Back to the products
            </button>
          </nav>
        </div>
      ) : null}

      {collectionOpen ? (
        <div className="store-collection" role="dialog" aria-modal="true" aria-label="The collection">
          <header className="store-collection__head">
            <p className="store-collection__title">The collection</p>
            <button type="button" className="store-collection__close" onClick={onCloseCollection}>
              Close
            </button>
          </header>
          {bootstrap.collection.length > 0 ? (
            <ul className="store-collection__grid">
              {bootstrap.collection.map((piece) => (
                <li key={piece.id} className="store-collection__piece">
                  <img className="store-collection__photo" src={piece.photo} alt={piece.name} loading="lazy" />
                  <p className="store-collection__name">{piece.name}</p>
                  <p className={`store-collection__price${piece.soldOut ? " is-sold" : ""}`}>{piecePrice(piece)}</p>
                  {piece.builderRoute && !piece.soldOut ? (
                    <a className="store-collection__build" href={piece.builderRoute}>
                      Build one like this
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="store-collection__note">Every piece Jesse has made will be shown here with its price. PLACEHOLDER: photographs and prices to come.</p>
              <ul className="store-collection__grid" aria-hidden="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <li key={i} className="store-collection__piece is-placeholder">
                    <span className="store-collection__photo">Photo to come</span>
                    <p className="store-collection__name">Name to come</p>
                    <p className="store-collection__price">Price to come</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}

      {story ? (
        <div className="store-story" role="dialog" aria-modal="true" aria-label={story.title}>
          <button type="button" className="store-story__shade" onClick={onCloseStory} aria-label="Close" />
          <figure className="store-story__frame">
            <video className="store-story__film" src={story.video} poster={story.poster} autoPlay loop playsInline muted={!audioEnabled} controls />
            <figcaption className="store-story__words">
              <span className="store-story__title">{story.title}</span>
              <span className="store-story__caption">{story.caption}</span>
            </figcaption>
            <button type="button" className="store-story__close" onClick={onCloseStory}>
              Close
            </button>
          </figure>
        </div>
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
          {stage === "browsing" ? (
            <button type="button" className="store-ui__look" onClick={onLookAround}>
              View collection
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
