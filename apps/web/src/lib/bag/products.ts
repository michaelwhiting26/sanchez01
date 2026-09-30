/**
 * Bag products: the slots the left/right buttons cycle through. Only Tiger and Monogram are live for now; Dragon, Koi and Gold Vein are kept
 * (commented) so they can be switched back on by uncommenting one line each. Copy is evidence-grounded (no claims).
 */
export type BagArtKey = "tigerfull" | "monogram" | "dragonfull" | "koifull" | "kintsugi";

export interface BagProduct {
  readonly id: string;
  readonly name: string;
  readonly sub: string;
  readonly art: BagArtKey;
  /** Trim colour of the top and bottom bands. */
  readonly trim: number;
  readonly bump: number;
  /** Price in minor units of one currency (e.g. 129900 = 1,299.00). null until Jesse confirms it: the site shows a marked placeholder, never an invented number. */
  readonly price: { readonly amountMinor: number; readonly currency: string } | null;
  readonly order: { readonly label: string; readonly href: string };
  readonly build: { readonly label: string; readonly href: string };
}

export const BAG_PRODUCTS: readonly BagProduct[] = [
  { id: "tiger", name: "Tiger", sub: "Heavy bag", art: "tigerfull", trim: 0xffffff, bump: 1.4, price: null, order: { label: "Order this bag", href: "/product" }, build: { label: "Build yourself", href: "/configure?preset=tigerfull" } },
  // PAUSED: { id: "dragon", name: "Dragon", sub: "After Hokusai · gold on oxblood", art: "dragonfull", trim: 0xc9a45c, bump: 1.3, order: { label: "Order this bag", href: "/product" }, build: { label: "Build yourself", href: "/configure?preset=dragon" } },
  // PAUSED: { id: "koi", name: "Koi", sub: "After Gakutei · coral on indigo", art: "koifull", trim: 0xe9e0cf, bump: 1.0, order: { label: "Order this bag", href: "/product" }, build: { label: "Build yourself", href: "/configure?preset=koi" } },
  { id: "monogram", name: "Monogram", sub: "Tone on tone · black on black", art: "monogram", trim: 0x1c1c1e, bump: 1.6, price: null, order: { label: "Order this bag", href: "/product" }, build: { label: "Build yourself", href: "/configure?preset=monogram" } },
  // PAUSED: { id: "kintsugi", name: "Gold Vein", sub: "Kintsugi leather", art: "kintsugi", trim: 0xb8953f, bump: 1.6, order: { label: "Order this bag", href: "/product" }, build: { label: "Build yourself", href: "/configure?preset=kintsugi" } },
];

/** "From £1,299" style text for a product, or the marked placeholder while the price is not confirmed. */
export function priceLabel(price: BagProduct["price"]): { text: string; placeholder: boolean } {
  if (!price) return { text: "Price: PLACEHOLDER, Jesse to confirm", placeholder: true };
  const text = new Intl.NumberFormat("en", { style: "currency", currency: price.currency }).format(price.amountMinor / 100);
  return { text, placeholder: false };
}
