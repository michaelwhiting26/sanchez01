import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PanelBuilder } from "@/components/build/PanelBuilder";
import { PageShell } from "@/components/pages/PageShell";
import { builderFor } from "@/lib/builder/registry";
import { WAITLIST_HREF } from "@/lib/catalogue";
import { CONTACT_HREF } from "@/lib/site";
import { STORE_PRODUCTS } from "@/lib/storefront/config";

export function generateStaticParams(): Array<{ slug: string }> {
  return STORE_PRODUCTS.map((p) => ({ slug: p.slug }));
}

/**
 * Where "Design this" in the 3D store leads. The heavy bag has its own builder. The gloves, the head guard and the groin guard share the panel
 * builder (owner, 7 Oct 2026, asked for them ahead of the rest). A product with no builder yet says so and offers a quote, with the waiting list as the second choice (nothing invented).
 */
export default async function BuildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "guards") redirect("/build/head-guard"); // the wall's old grouped "Guards" place: links to it still land somewhere useful
  const product = STORE_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();
  if (product.slug === "heavy-bag") redirect("/configure");
  if (product.active && builderFor(product.slug)) return <PanelBuilder slug={product.slug} />; // a product whose model is not finished is not active yet
  return (
    <PageShell eyebrow="Builder" title={product.name}>
      <p className="pg__lead">The {product.name.toLowerCase()} do not have a 3D builder yet. Jesse makes them to order: tell him what you want and he will quote it.</p>
      <div className="pg__actions">
        <Link className="pg__btn" href={CONTACT_HREF}>
          Get a Quote
        </Link>
        <Link className="pg__btn pg__btn--ghost" href={WAITLIST_HREF}>
          Tell me when the builder opens
        </Link>
      </div>
    </PageShell>
  );
}
