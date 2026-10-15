import Link from "next/link";
import type { ShopProduct } from "@/lib/shop/catalogue";
import { QUOTE_FOR } from "@/lib/shop/journey";

/**
 * One of Jesse's builds on the home page (owner, 15 Oct 2026): his own photograph, then two ways to order it as a quote request
 * ("Order this one", "This, but different") and, where a builder exists, a quieter way into 3D. No price until Jesse confirms it.
 */
export function BuildCard({ product }: { product: ShopProduct }) {
  const q = QUOTE_FOR[product.slug] ?? "other";
  const piece = encodeURIComponent(product.name);
  return (
    <article className="sh-card sh-card--build">
      <span className="sh-card__pic">
        <img src={product.image.src} alt={product.image.alt} width={product.image.width} height={product.image.height} loading="lazy" />
        {product.ready ? <span className="sh-card__3d">3D</span> : null}
      </span>
      <span className="sh-card__body">
        <span className="sh-card__name">{product.name}</span>
        <span className="sh-card__line">{product.line}</span>
        <span className="sh-card__price">Price to come</span>
        <span className="sh-card__acts">
          <Link className="sh-btn sh-btn--small" href={`/contact?product=${q}&start=this&piece=${piece}`}>
            Order this one
          </Link>
          <Link className="sh-btn sh-btn--small sh-btn--line" href={`/contact?product=${q}&start=change&piece=${piece}`}>
            This, but different
          </Link>
        </span>
        {product.ready ? (
          <Link className="sh-card__to3d" href={product.href}>
            Or design it in 3D
          </Link>
        ) : null}
      </span>
    </article>
  );
}
