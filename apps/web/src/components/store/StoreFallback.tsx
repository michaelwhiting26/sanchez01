import Link from "next/link";
import type { StoreBootstrap } from "@/lib/storefront/types";
import { formatPrice } from "./StoreUI";

/**
 * The same journey without 3D, for phones that cannot draw it or visitors on data saver (spec: low-end fallback): the same products, names, prices and
 * buttons, as a swipeable row. TODO: pre-rendered clips of the walk-in and of each product, once the real room and models exist to film.
 */
export function StoreFallback({ bootstrap }: { bootstrap: StoreBootstrap }) {
  return (
    <div className="store-fallback">
      <header className="store-ui__brand">
        <p className="store-ui__wordmark">Sanchez</p>
        <p className="store-ui__sub">Custom Boxing</p>
      </header>
      <p className="store-fallback__hello">Welcome to Sanchez. Let&rsquo;s make something that&rsquo;s yours.</p>
      <ul className="store-fallback__row">
        {bootstrap.products.map((p, i) => (
          <li key={p.id} className="store-fallback__card">
            <p className="store-ui__count">
              {i + 1} / {bootstrap.products.length}
            </p>
            <h2 className="store-ui__name">{p.name}</h2>
            <p className="store-ui__tagline">{p.tagline}</p>
            <p className="store-ui__price">{formatPrice(p)}</p>
            <Link className="pg__btn" href={p.builderRoute}>
              Design it
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
