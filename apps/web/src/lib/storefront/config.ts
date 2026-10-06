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
    scene: { exterior: `${S}/exterior.glb`, workshop: `${S}/workshop.glb`, jesse: `${S}/jesse.glb` },
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
  [-0.2, 1.66, -1.8],
];
/** Where the eyes rest along that walk: the door, then the room, then Jesse. The last point is replaced by LOOK_GREETING from the workshop file. */
export const ENTRANCE_LOOK_PATH: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1.95, 0],
  [0.02, 1.6, -1.2],
  [0.5, 1.52, -3.2],
  [1.3, 1.5, -3.3],
];

export const TIMING = { enter: 2.8, firstProduct: 1.3, swipe: 0.65, focus: 0.7, greeting: 4.0, greetingBack: 2.0 } as const;
