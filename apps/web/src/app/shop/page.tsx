import { ProductCard } from "@/components/shop/ProductCard";
import { ShopShell } from "@/components/shop/ShopShell";
import { SHOP_PRODUCTS } from "@/lib/shop/catalogue";

export const metadata = { title: "Design in 3D | Sanchez Custom Boxing" };

/** The shop grid: every product, each opening its own 3D builder. */
export default function ShopPage() {
  return (
    <ShopShell>
      <section className="sh-wrap sh-sec sh-sec--first">
        <p className="sh-crumb">Home / Design in 3D</p>
        <h1 className="sh-h">Design in 3D</h1>
        <p className="sh-count">Showing all {SHOP_PRODUCTS.length} products</p>
        <div className="sh-grid">
          {SHOP_PRODUCTS.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </ShopShell>
  );
}
