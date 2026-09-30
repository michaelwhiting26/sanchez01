import Link from "next/link";
import { PageShell } from "@/components/pages/PageShell";
import { BAG_PRODUCTS } from "@/lib/bag/products";

export const metadata = { title: "Build your bag | Sanchez Custom Boxing" };

const PRESET_FOR: Record<string, string> = { tigerfull: "tiger", monogram: "monogram" };

/** The build step: pick the design to start from, then go on to the waitlist (there is no checkout yet). Unknown presets fall back to the first design. */
export default async function ConfigurePage({ searchParams }: { searchParams: Promise<{ preset?: string }> }) {
  const { preset } = await searchParams;
  const wanted = PRESET_FOR[preset ?? ""] ?? preset ?? "";
  const selected = BAG_PRODUCTS.find((p) => p.id === wanted)?.id ?? BAG_PRODUCTS[0]?.id;
  return (
    <PageShell eyebrow="Step 1 of 2" title="Build your bag">
      <p className="pg__lead">Start from a design. The full builder (panels, colours, name) is on its way; join the waitlist and you will be first in.</p>
      <ul className="pg__list">
        {BAG_PRODUCTS.map((p) => (
          <li key={p.id}>
            <Link href={`/configure?preset=${p.id}`} aria-current={p.id === selected}>
              {p.name}
              <small>{p.sub}</small>
            </Link>
          </li>
        ))}
      </ul>
      <div className="pg__actions">
        <Link className="pg__btn" href="/#waitlist">
          Continue to the waitlist
        </Link>
        <Link className="pg__btn pg__btn--ghost" href="/product">
          Back to the bag
        </Link>
      </div>
    </PageShell>
  );
}
