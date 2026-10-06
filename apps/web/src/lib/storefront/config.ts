import type { CollectionPiece, StoreBootstrap, StoreProduct, WallStory } from "./types";

/**
 * The store's content. This is the source for GET /api/storefront/bootstrap until the products table (migration 002) is filled from an admin.
 * Evidence rule: no price is confirmed for any product, so every priceFromMinor is null and the UI says "Price to come".
 * Real models exist for the heavy bag and the focus mitts only; the rest are stand-in forms and say so.
 */
const S = "/assets/store";

export const STORE_PRODUCTS: readonly StoreProduct[] = [
  { id: "gloves", slug: "gloves", name: "Custom Gloves", tagline: "Handmade in Pattaya", priceFromMinor: null, currency: "AUD", cameraAnchor: "GLOVES", modelAsset: `${S}/standin-gloves.glb`, builderRoute: "/build/gloves", sortOrder: 1, active: true, standIn: true, hangs: false, displayHeight: 0.36 },
  { id: "heavy-bag", slug: "heavy-bag", name: "Heavy Bag", tagline: "Handmade in Pattaya", priceFromMinor: null, currency: "AUD", cameraAnchor: "BAG", modelAsset: `${S}/heavy-bag.glb`, builderRoute: "/build/heavy-bag", sortOrder: 2, active: true, standIn: false, hangs: true, displayHeight: 1.75 },
  { id: "thai-pads", slug: "thai-pads", name: "Thai Pads", tagline: "Handmade in Pattaya", priceFromMinor: null, currency: "AUD", cameraAnchor: "THAI_PADS", modelAsset: `${S}/standin-thai-pads.glb`, builderRoute: "/build/thai-pads", sortOrder: 3, active: true, standIn: true, hangs: false, displayHeight: 0.44 },
  { id: "focus-mitts", slug: "focus-mitts", name: "Focus Mitts", tagline: "Handmade in Pattaya", priceFromMinor: null, currency: "AUD", cameraAnchor: "MITTS", modelAsset: `${S}/focus-mitts.glb`, builderRoute: "/build/focus-mitts", sortOrder: 4, active: true, standIn: false, hangs: false, displayHeight: 0.3, modelRotation: [Math.PI / 2, 0, 0] },
  { id: "guards", slug: "guards", name: "Guards", tagline: "Handmade in Pattaya", priceFromMinor: null, currency: "AUD", cameraAnchor: "GUARDS", modelAsset: `${S}/standin-guards.glb`, builderRoute: "/build/guards", sortOrder: 5, active: true, standIn: true, hangs: false, displayHeight: 0.42 },
];

/**
 * The wall. Each entry is one of Jesse's own films from his current site, already in this project at web size. The hotspot for the first sits on
 * the Sanchez banner on his wall. Captions state only what the film shows; his own words about it are for him to record.
 */
export const STORE_WALL: readonly WallStory[] = [
  {
    id: "the-workshop",
    title: "The workshop",
    caption: "Jesse at the sewing machine. Designed in Sydney. Handmade in Pattaya.",
    video: "/assets/carousel/clip1.mp4",
    poster: "/assets/carousel/clip1.jpg",
    position: [6.05, 1.73, -1.12],
  },
];

const C = "/assets/store/collection";

/**
 * The collection: finished pieces Jesse has made, each with its photograph and price (owner, 6 Oct 2026). The first ten also hang on the
 * display on his wall, in this order.
 * The four below are cut from two of his own Instagram posts, supplied by the owner on 6 Oct 2026. Their names only say what the photograph
 * shows. NO PRICE IS CONFIRMED for any of them, so each reads "Price to come". The mitts are shown as a close detail on purpose: the full
 * photograph carries a named person's name stitched on the mitts, which needs that person's written consent before it appears here.
 * TODO(owner): a price and currency for each, more pieces, and whether any is sold.
 */
export const STORE_COLLECTION: readonly CollectionPiece[] = [
  { id: "bag-range", name: "Heavy bags", photo: `${C}/bag-range.webp`, priceMinor: null, currency: "AUD", soldOut: false, builderRoute: "/build/heavy-bag" },
  { id: "bag-white", name: "Heavy bag, white", photo: `${C}/bag-white.webp`, priceMinor: null, currency: "AUD", soldOut: false, builderRoute: "/build/heavy-bag" },
  { id: "bag-tricolour", name: "Heavy bag, red, white and green", photo: `${C}/bag-tricolour.webp`, priceMinor: null, currency: "AUD", soldOut: false, builderRoute: "/build/heavy-bag" },
  { id: "mitt-detail", name: "Custom micro mitts", photo: `${C}/mitt-detail.webp`, priceMinor: null, currency: "AUD", soldOut: false, builderRoute: "/build/focus-mitts" },
];

/** Where the collection's marker sits: on the collection display on his wall (tools/store/jesse_workshop.py). */
export const COLLECTION_SPOT: readonly [number, number, number] = [6.02, 2.2, -2.75];
/** How many tiles the display on the wall has. Pieces beyond this show in the collection grid only. */
export const COLLECTION_WALL_TILES = 10;

export function getStoreBootstrap(): StoreBootstrap {
  return {
    version: "2026.10.1",
    scene: { exterior: `${S}/exterior.glb`, workshop: `${S}/workshop.glb`, workshopLight: `${S}/workshop-light.webp`, jesse: `${S}/jesse.glb` },
    // TODO(owner): record the real workshop room tone, the street tone and the door. Null means silent; nothing is faked with stock sound.
    audio: { streetTone: null, roomTone: null, doorOpen: null },
    voice: {
      // TODO(owner): Jesse records these lines; then run tools/store/visemes to fill `visemes`. Until then the captions carry the greeting.
      welcome: {
        src: null,
        duration: 3.5,
        captions: [
          { text: "Welcome to Sanchez.", start: 1.1, end: 2.2 },
          { text: "Let's make something that's yours.", start: 2.2, end: 3.9 },
        ],
        visemes: [],
      },
      welcomeBack: { src: null, duration: 1.2, captions: [{ text: "Welcome back.", start: 0.6, end: 1.8 }], visemes: [] },
    },
    products: STORE_PRODUCTS.filter((p) => p.active).toSorted((a, b) => a.sortOrder - b.sortOrder),
    wall: STORE_WALL,
    collection: STORE_COLLECTION,
    experience: { greetingEnabled: true, soundDefault: false },
  };
}

/** The walk from across the street to the greeting spot, in the web scene's space (door at z = 0). The first point is the arrival shot, composed for a phone held upright. */
export const ENTRANCE_PATH: ReadonlyArray<readonly [number, number, number]> = [
  [0.45, 1.62, 7.65],
  [0.3, 1.66, 5.2],
  [0.12, 1.68, 2.6],
  [-0.05, 1.67, 0.1],
  [0.35, 1.6, -1.2],
  [0.7, 1.45, -2.6],
  [1.0, 1.22, -3.95],
];
/** Where the eyes rest along that walk: the door, then the room, then Jesse. The last point is replaced by LOOK_GREETING from the workshop file. */
export const ENTRANCE_LOOK_PATH: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1.95, 0],
  [0.3, 1.6, -1.5],
  [1.5, 1.45, -2.8],
  [2.8, 1.3, -3.4],
  [3.3, 1.12, -3.55],
];

/**
 * Seconds for each camera move and for the greeting. Deliberately unhurried (owner, 6 Oct 2026: the faster moves swung the view round and felt
 * like motion sickness on a phone). The walk-in covers about twelve metres and turns to face Jesse; the first product is a quarter turn back.
 */
/** `greeting` and `greetingBack` are how long Jesse waits for an answer before showing the first product himself. He asks; the visitor chooses. */
export const TIMING = { enter: 5.8, firstProduct: 3.0, swipe: 1.2, focus: 1.0, greeting: 12, greetingBack: 12 } as const;
