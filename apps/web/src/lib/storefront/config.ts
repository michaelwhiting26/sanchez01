import type { StoreBootstrap, StoreProduct } from "./types";

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
    experience: { greetingEnabled: true, soundDefault: false },
  };
}

/** The walk from across the street to the greeting spot, in the web scene's space (door at z = 0). The first point is the arrival shot, composed for a phone held upright. */
export const ENTRANCE_PATH: ReadonlyArray<readonly [number, number, number]> = [
  [0.45, 1.62, 7.65],
  [0.3, 1.66, 5.2],
  [0.12, 1.68, 2.6],
  [-0.05, 1.67, 0.1],
  [-0.55, 1.66, -1.4],
  [-1.7, 1.63, -3.1],
  [-2.2, 1.6, -4.4],
];
/** Where the eyes rest along that walk: the door, then the room, then Jesse. The last point is replaced by LOOK_GREETING from the workshop file. */
export const ENTRANCE_LOOK_PATH: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1.95, 0],
  [0.3, 1.6, -1.5],
  [1.2, 1.45, -3.0],
  [1.9, 1.4, -3.4],
  [2.2, 1.35, -3.45],
];

/**
 * Seconds for each camera move and for the greeting. Deliberately unhurried (owner, 6 Oct 2026: the faster moves swung the view round and felt
 * like motion sickness on a phone). The walk-in covers about twelve metres and turns to face Jesse; the first product is a quarter turn back.
 */
export const TIMING = { enter: 5.8, firstProduct: 3.0, swipe: 1.2, focus: 1.0, greeting: 4.0, greetingBack: 3.2 } as const;
