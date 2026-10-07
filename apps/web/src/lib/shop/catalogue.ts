import { STORE_PRODUCTS } from "../storefront/config";

/**
 * The shop's content (owner, 7 Oct 2026: after showing Jesse the 3D store, the site is rebuilt as a plain shop on the pattern of another maker's
 * site: header, product grid, "design in 3D" on each product). Only the layout pattern is followed. Every word and picture here is ours.
 * Evidence rule: no price is confirmed for any product, so every card reads "Price to come"; custom orders are not open, so nothing says "buy".
 * TODO(owner): Jesse's own product photographs replace the pictures below as they arrive (one path per entry).
 */
const P = "/assets/shop";
/** Jesse's own product photographs, cut out onto a clear background (tools/cutouts; masters in Dropbox assets/product-cutouts). */
const W = "/assets/products";

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
  // the brown pair, not the pair lettered with a trainer's full name: a named person on the shop front needs that person's written consent first
  "focus-mitts": { src: `${W}/focus-mitts-brown-zv-pair.webp`, alt: "A pair of Sanchez focus mitts photographed in the workshop, brown leather with the Sanchez badge", width: 1247, height: 1247 },
  "groin-guard": { src: `${W}/groin-guard-sh-large-card.webp`, alt: "A Sanchez groin guard photographed in the workshop, red and blue leather with white lettering", width: 1211, height: 572 },
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

export interface WorkPiece {
  readonly id: string;
  readonly label: string;
  readonly image: string;
  readonly alt: string;
}

/**
 * From the workshop: finished pieces Jesse has made, from his own photographs. Only pieces that carry no person's full name are shown; the pairs
 * lettered for named people (in the same folder) wait for each person's written consent. Labels say only what the photograph shows.
 */
export const SHOP_WORK: readonly WorkPiece[] = [
  { id: "mitts-brown-pair", label: "Focus mitts", image: `${W}/focus-mitts-brown-zv-pair.webp`, alt: "Brown leather focus mitts, one face down, one showing the Sanchez badge and stitched initials" },
  { id: "mitts-shamrock-gloss", label: "Striking face, gloss", image: `${W}/focus-mitts-shamrock-face-gloss.webp`, alt: "The striking face of a focus mitt in gloss green with a stitched shamrock" },
  { id: "groin-guards-set", label: "Groin guards", image: `${W}/groin-guard-sh-set.webp`, alt: "Two red and blue groin guards with white lettering and a cross on the front" },
  { id: "mitts-red-white-blue", label: "Focus mitts", image: `${W}/focus-mitts-red-white-blue-pair.webp`, alt: "A pair of focus mitts in red, white and blue leather" },
  { id: "mitts-brown-side", label: "Lacing, side on", image: `${W}/focus-mitts-brown-zv-side-pair.webp`, alt: "Two brown focus mitts back to back, showing the laced edge" },
  { id: "mitts-shamrock-matte", label: "Striking face, matte", image: `${W}/focus-mitts-shamrock-face-matte-left.webp`, alt: "The striking face of a focus mitt in matte green with a stitched shamrock" },
  { id: "mitts-hand-opening", label: "Hand opening", image: `${W}/focus-mitts-freddie-roach-hand-opening.webp`, alt: "A focus mitt seen from the wrist, showing the hand opening and the laced rim" },
  { id: "groin-guard-large", label: "Groin guard", image: `${W}/groin-guard-sh-large.webp`, alt: "A red and blue groin guard with white lettering, seen from the front" },
];

export const SHOP_NAV = [
  { href: "/shop", label: "Design in 3D" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/gym-fit-outs", label: "Gym Fit-Out" },
  { href: "/contact", label: "Get a Quote" },
] as const;

export const SHOP_STEPS = [
  { n: "1", title: "Pick a product", text: "Gloves, a heavy bag, a head guard or a groin guard." },
  { n: "2", title: "Create your design", text: "Colour each panel, add your logo and your name, and turn it round in 3D." },
  { n: "3", title: "Send it to the workshop", text: "Orders are not open yet. Join the list and we will tell you the day they are." },
] as const;

/**
 * Jesse's own wording, taken word for word from his current site (sanchezboxing.com.au, read 7 Oct 2026; saved copy in specs/wix-scrape-README.md).
 * Two things of his are left out on purpose. "Australian handmade" is not used: the pieces are made in Pattaya, so the origin line stands in its
 * place. "Trusted by the best" is not used: on his site it sits over client logos, and no client has given written consent yet.
 */
export const JESSE_HEADLINE = "World class." as const;

export const JESSE_CONSULTATION = {
  title: "Personalised design consultation",
  items: ["Customisable colours", "Customisable materials", "Customisable stitching", "Customisable screen print", "Customisable patch work", "Customisable shape"],
  action: "Get a Quote",
} as const;

/** His four key features. They describe how his bags are made; the fourth has a heading only on his site. */
export const JESSE_FEATURES = [
  { title: "Precision cutting", text: "Every piece of Persian vinyl used to make your bag is hand cut with elite precision." },
  { title: "Reinforced adhesive", text: "HH-66 Vinyl Cement (by RH Adhesives) market-leading, solvent-based adhesive, engineered for a bond stronger than the vinyl itself, rapid setting, and extreme durability." },
  { title: "Silicone based durable screen printing", text: "High-durability silicone-based screen printing, a technique that applies a flexible, permanent design directly onto the bag's surface for a long-lasting, impact-resistant finish that withstands heavy use." },
  { title: "Masterclass stitchwork", text: null },
] as const;

export const JESSE_QUOTE_TITLE = "Request a Quote from the Owner" as const;

export const JESSE_GYM = {
  title: "Custom Gym Fit Out Service",
  steps: [
    { n: "Step 1", title: "Questionnaire & Consultation", text: "We need to know your deadlines, what you need, and your budget allocation." },
    { n: "Step 2", title: "Project Proposal", text: "We draft and present a project scope and timeline to you based on the initial consultation." },
    { n: "Step 3", title: "Quote & Deposit", text: "A quote is sent out and if you are happy with it, a 50% deposit to cover materials is paid." },
    { n: "Step 4", title: "Get it Done.", text: "What we do best." },
  ],
  action: "Request Consultation",
} as const;
