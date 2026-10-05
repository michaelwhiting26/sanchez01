/**
 * Other Sanchez products beyond the heavy bag, for the "More from Sanchez" carousel. Sourced only from what already exists in the repo
 * (the product-type bar in components/home/BagPunch.tsx and specs/04 §5 collections). Nothing here is invented: no price is known for any of them,
 * and only the heavy bag can be built and ordered today, so every entry here is a waitlist item.
 */
export interface CatalogueItem {
  readonly id: string;
  readonly name: string;
  readonly sub: string;
  /** Existing render, or null for a text card. */
  readonly image: { readonly src: string; readonly alt: string } | null;
  /** True when it can be built and ordered now (then `href` is its page); false sends the visitor to the waitlist. */
  readonly orderable: boolean;
  readonly href: string;
  /** Minor units, or null until Jesse confirms it (the card then shows "Price to come"). */
  readonly price: { readonly amountMinor: number; readonly currency: string } | null;
}

export const WAITLIST_HREF = "/superseded#waitlist" as const;

export const OTHER_PRODUCTS: readonly CatalogueItem[] = [
  {
    id: "mitts",
    name: "Focus mitts",
    sub: "Render · final colours and materials to be confirmed",
    image: { src: "/assets/mitts/mitt_front.png", alt: "A pair of Sanchez focus mitts, orange leather with a green ribbed pocket and the Sanchez logo" },
    orderable: false,
    href: WAITLIST_HREF,
    price: null,
  },
  { id: "gloves", name: "Gloves", sub: "Render to come", image: null, orderable: false, href: WAITLIST_HREF, price: null },
];
