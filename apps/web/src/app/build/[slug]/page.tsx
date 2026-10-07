import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GloveBuilder } from "@/components/build/GloveBuilder";
import { PageShell } from "@/components/pages/PageShell";
import { WAITLIST_HREF } from "@/lib/catalogue";
import { STORE_PRODUCTS } from "@/lib/storefront/config";

export function generateStaticParams(): Array<{ slug: string }> {
  return STORE_PRODUCTS.map((p) => ({ slug: p.slug }));
}

/**
 * Where "Design this" in the 3D store leads. The heavy bag and the gloves have builders (owner, 7 Oct 2026, asked for the glove builder ahead of the
 * rest). The other products' builders are Parts 5 to 12 of the store and are not built yet: they say so and offer the waiting list (nothing invented).
 */
export default async function BuildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = STORE_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();
  if (product.slug === "heavy-bag") redirect("/configure");
  if (product.slug === "gloves") return <GloveBuilder />;
  return (
    <PageShell eyebrow="Builder" title={product.name}>
      <p className="pg__note">PLACEHOLDER: the {product.name.toLowerCase()} builder is not built yet. Join the waiting list and we will tell you when it opens.</p>
      <Link className="pg__btn" href={WAITLIST_HREF}>
        Join the list
      </Link>
    </PageShell>
  );
}
