import Link from "next/link";
import { notFound } from "next/navigation";
import { CardGallery } from "@/components/shop/CardGallery";
import { ShopShell } from "@/components/shop/ShopShell";
import { TickOrder } from "@/components/shop/TickOrder";
import { SHOP_GALLERIES, SHOP_PRODUCTS } from "@/lib/shop/catalogue";
import { QUOTE_FOR } from "@/lib/shop/journey";
import { pieceOptions } from "@/lib/shop/pieces";

/**
 * One product's order page (owner, 15 Oct 2026): Jesse's photographs on the left (dots where he has several angles), the tick-box
 * request on the right. "Order this one" and "This, but different" on the home page both land here (?mode=as-is / ?mode=change);
 * "Design it in 3D" stays the third way. No price until Jesse confirms it.
 */
export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: string }> {
  return SHOP_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/piece/[slug]">) {
  const { slug } = await params;
  const product = SHOP_PRODUCTS.find((p) => p.slug === slug);
  return { title: product ? `${product.name}: order yours | Sanchez Custom Boxing` : "Sanchez Custom Boxing" };
}

export default async function PiecePage({ params }: PageProps<"/piece/[slug]">) {
  const { slug } = await params;
  const product = SHOP_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();
  const images = SHOP_GALLERIES[slug] ?? [product.image];
  const options = pieceOptions(slug);
  return (
    <ShopShell>
      <section className="sh-wrap sh-sec sh-piece">
        <p className="sh-crumb">
          <Link href="/#choose">Get yours made</Link> / {product.name}
        </p>
        <div className="sh-piece__grid">
          <div className="sh-piece__media">
            <CardGallery images={images} label={product.name} />
          </div>
          <div className="sh-piece__side">
            <h1 className="sh-h sh-h--small">{product.name}</h1>
            <p className="sh-piece__price">Price to come · Jesse quotes every order</p>
            <TickOrder
              slug={slug}
              name={product.name}
              quoteProduct={QUOTE_FOR[slug] ?? "other"}
              colourways={options.colourways}
              palette={options.palette}
              extras={options.extras}
              builderHref={product.ready ? product.href : null}
            />
          </div>
        </div>
      </section>
    </ShopShell>
  );
}
