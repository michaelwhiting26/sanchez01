import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PanelBuilder } from "@/components/build/PanelBuilder";
import { PageShell } from "@/components/pages/PageShell";
import { builderFor } from "@/lib/builder/registry";
import { WAITLIST_HREF } from "@/lib/catalogue";
import { STORE_PRODUCTS } from "@/lib/storefront/config";

export function generateStaticParams(): Array<{ slug: string }> {
  return STORE_PRODUCTS.map((p) => ({ slug: p.slug }));
}

/**
 * Where "Design this" in the 3D store leads. The heavy bag has its own builder. The gloves, the head guard and the groin guard share the panel
 * builder (owner, 7 Oct 2026, asked for them ahead of the rest). A product with no builder yet says so and offers the waiting list (nothing invented).
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
      <p className="pg__note">PLACEHOLDER: the {product.name.toLowerCase()} builder is not built yet. Join the waiting list and we will tell you when it opens.</p>
      <Link className="pg__btn" href={WAITLIST_HREF}>
        Join the list
      </Link>
    </PageShell>
  );
}
