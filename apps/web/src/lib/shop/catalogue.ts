import { STORE_PRODUCTS } from "../storefront/config";

/**
 * The shop's content (owner, 7 Oct 2026: after showing Jesse the 3D store, the site is rebuilt as a plain shop on the pattern of another maker's
 * site: header, product grid, "design in 3D" on each product). Only the layout pattern is followed. Every word and picture here is ours.
 * Evidence rule: no price is confirmed for any product, so every card reads "Price to come"; custom orders are not open, so nothing says "buy".
 * TODO(owner): Jesse's own product photographs replace the pictures below as they arrive (one path per entry).
 */
const P = "/assets/shop";

export interface ShopProduct {
  readonly slug: string;
  readonly name: string;
  /** One plain line under the name: what the builder lets you do. */
  readonly line: string;
  readonly image: { readonly src: string; readonly alt: string; readonly width: number; readonly height: number };
  readonly href: string;
  /** False while the product has no 3D builder yet: the card says so and leads to the waiting list page. */
  readonly ready: boolean;
}

const PICTURES: Record<string, ShopProduct["image"]> = {
  gloves: { src: `${P}/gloves.webp`, alt: "A black boxing glove with brass piping, from the 3D builder", width: 529, height: 900 },
  "heavy-bag": { src: "/assets/brand/bag-footer.webp", alt: "A red Sanchez heavy bag hanging from its chain", width: 800, height: 1200 },
  "head-guard": { src: `${P}/head-guard.webp`, alt: "A black head guard with a brass-edged face opening, from the 3D builder", width: 640, height: 900 },
  "focus-mitts": { src: "/assets/mitts/mitt_front.png", alt: "A pair of Sanchez focus mitts, orange leather with a green ribbed pocket", width: 1400, height: 1000 },
  "groin-guard": { src: `${P}/groin-guard.webp`, alt: "A black groin guard with a brass waist edge, from the 3D builder", width: 900, height: 856 },
};

const LINES: Record<string, string> = {
  gloves: "Colour every panel, add your logo and name",
  "heavy-bag": "Size, colours, bands and lettering",
  "head-guard": "Colour every panel, add your logo and name",
  "focus-mitts": "3D builder to come",
  "groin-guard": "Colour every panel, add your logo and name",
};

const NO_BUILDER_YET = new Set(["focus-mitts"]);

export const SHOP_PRODUCTS: readonly ShopProduct[] = STORE_PRODUCTS.filter((p) => p.active)
  .toSorted((a, b) => a.sortOrder - b.sortOrder)
  .flatMap((p) => {
    const image = PICTURES[p.slug];
    return image ? [{ slug: p.slug, name: p.name, line: LINES[p.slug] ?? "", image, href: p.builderRoute, ready: !NO_BUILDER_YET.has(p.slug) }] : [];
  });

export interface ShopTile {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly image: string;
  readonly alt: string;
  /** A photograph fills the tile; a product picture on a clear background sits inside it. */
  readonly fill: boolean;
}

/** The range, as picture tiles. Photographs are Jesse's own (already in the project); the rest are the builders' models until his photographs arrive. */
export const SHOP_TILES: readonly ShopTile[] = [
  { id: "gloves", label: "Gloves", href: "/build/gloves", image: `${P}/gloves.webp`, alt: "", fill: false },
  { id: "heavy-bags", label: "Heavy bags", href: "/build/heavy-bag", image: "/assets/store/collection/bag-range.webp", alt: "A row of Sanchez heavy bags in a gym", fill: true },
  { id: "focus-mitts", label: "Focus mitts", href: "/build/focus-mitts", image: "/assets/store/collection/mitt-detail.webp", alt: "Close detail of a Sanchez focus mitt: tan leather over a green ribbed pocket", fill: true },
  { id: "head-guards", label: "Head guards", href: "/build/head-guard", image: `${P}/head-guard.webp`, alt: "", fill: false },
  { id: "groin-guards", label: "Groin guards", href: "/build/groin-guard", image: `${P}/groin-guard.webp`, alt: "", fill: false },
  { id: "gyms", label: "Gym fit-outs", href: "/gym-fit-outs", image: "/assets/store/collection/bag-white.webp", alt: "Sanchez heavy bags standing together, black, white and tricolour", fill: true },
];

export const SHOP_NAV = [
  { href: "/shop", label: "Design in 3D" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/gym-fit-outs", label: "Gyms and clubs" },
  { href: "/contact", label: "Contact" },
] as const;

export const SHOP_STEPS = [
  { n: "1", title: "Pick a product", text: "Gloves, a heavy bag, a head guard or a groin guard." },
  { n: "2", title: "Create your design", text: "Colour each panel, add your logo and your name, and turn it round in 3D." },
  { n: "3", title: "Send it to the workshop", text: "Orders are not open yet. Join the list and we will tell you the day they are." },
] as const;
