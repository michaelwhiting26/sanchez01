import Link from "next/link";
import { PageShell } from "@/components/pages/PageShell";
import { MoreFromSanchez } from "@/components/pages/MoreFromSanchez";
import { BAG_PRODUCTS, priceLabel } from "@/lib/bag/products";

export const metadata = { title: "The bag | Sanchez Custom Boxing" };

/** The bag: what it is, its price line (marked placeholder until confirmed), and the way onward (build it), and the rest of the range. */
export default function ProductPage() {
  const first = BAG_PRODUCTS[0];
  const price = priceLabel(first?.price ?? null);
  return (
    <PageShell eyebrow="Heavy bag" title="Your bag">
      <img className="pg__bag" src="/assets/brand/bag-footer.webp" alt="A Sanchez heavy bag" width={400} height={600} />
      <p className="pg__lead">Cut, stitched and printed by hand. Designed in Sydney. Handmade in Pattaya.</p>
      <p className="pg__note">{price.text}</p>
      <div className="pg__actions">
        <Link className="pg__btn" href="/configure">
          Build yourself
        </Link>
      </div>
      <MoreFromSanchez />
    </PageShell>
  );
}
