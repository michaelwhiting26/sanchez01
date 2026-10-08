import Link from "next/link";
import type { ShopProduct } from "@/lib/shop/catalogue";

/** One product on the shop grid: its picture, the 3D mark, its name, and the way into its builder. */
export function ProductCard({ product, compact = false }: { product: ShopProduct; compact?: boolean }) {
  return (
    <Link href={product.href} className="sh-card" data-compact={compact || undefined}>
      <span className="sh-card__pic">
        <img src={product.image.src} alt={product.image.alt} width={product.image.width} height={product.image.height} loading="lazy" />
        {product.ready ? <span className="sh-card__3d">3D</span> : <span className="sh-card__soon">Coming</span>}
      </span>
      <span className="sh-card__body">
        <span className="sh-card__name">{product.name}</span>
        {compact ? null : (
          <>
            <span className="sh-card__line">{product.line}</span>
            <span className="sh-card__price">Price to come</span>
            <span className="sh-card__go">{product.ready ? "Customise now" : "Get a Quote"}</span>
          </>
        )}
      </span>
    </Link>
  );
}
