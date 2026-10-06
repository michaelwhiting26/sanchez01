/** Shared types for the 3D store (docs/STORE-3D.md). No three.js here: the server, the UI and the tests all read these. */
export interface StoreProduct {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  /** Minor units, or null until Jesse confirms a price (evidence rule: never invented). */
  readonly priceFromMinor: number | null;
  readonly currency: string;
  /** Suffix of the Blender empties: CAM_PRODUCT_<anchor>, LOOK_PRODUCT_<anchor>, CAM_FOCUS_<anchor>, PRODUCT_<anchor>. */
  readonly cameraAnchor: string;
  readonly modelAsset: string;
  readonly builderRoute: string;
  readonly sortOrder: number;
  readonly active: boolean;
  /** True while the model is an anonymous cloth-covered form because no real model exists yet. */
  readonly standIn: boolean;
  /** Hangs from the rail (a bag) rather than sitting on the shelf. */
  readonly hangs: boolean;
  /** Height the model is scaled to in the room, in metres (measured after `modelRotation`). */
  readonly displayHeight: number;
  /** Turns the model upright and towards the visitor when its file was authored lying down. Radians, x y z. */
  readonly modelRotation?: readonly [number, number, number];
}

export interface CaptionLine {
  readonly text: string;
  readonly start: number;
  readonly end: number;
}

export interface Viseme {
  readonly t: number;
  readonly shape: string;
  readonly weight: number;
}

export interface VoiceClip {
  /** Audio file, or null until Jesse has recorded it (the captions and timing still run). */
  readonly src: string | null;
  readonly duration: number;
  readonly captions: readonly CaptionLine[];
  readonly visemes: readonly Viseme[];
}

/** Something on the workshop wall the visitor can tap while looking around: a short film or picture with a line about it. */
export interface WallStory {
  readonly id: string;
  readonly title: string;
  readonly caption: string;
  readonly video: string;
  readonly poster: string;
  /** Where its hotspot sits in the room, in the web scene's space. */
  readonly position: readonly [number, number, number];
}

/** One finished piece in the collection: something Jesse has actually made, shown with its photograph and its price. */
export interface CollectionPiece {
  readonly id: string;
  readonly name: string;
  /** A photograph of the real piece, served from this site. */
  readonly photo: string;
  /** Price in minor units (cents), or null while it is not confirmed. */
  readonly priceMinor: number | null;
  readonly currency: "AUD" | "AED" | "SGD" | "GBP" | "USD";
  readonly soldOut: boolean;
  /** Where "Build one like this" goes, if this kind of piece has a builder. */
  readonly builderRoute: string | null;
}

export interface StoreBootstrap {
  readonly version: string;
  /** `workshopLight` is the room's baked light: a picture that must come from the same bake as `workshop` (tools/store/bake_light.py). */
  readonly scene: { readonly exterior: string; readonly workshop: string; readonly workshopLight: string; readonly jesse: string };
  readonly audio: { readonly streetTone: string | null; readonly roomTone: string | null; readonly doorOpen: string | null };
  readonly voice: { readonly welcome: VoiceClip; readonly welcomeBack: VoiceClip };
  readonly products: readonly StoreProduct[];
  /** The stories on the wall. One to begin with, to prove the idea (owner, 6 Oct 2026). */
  readonly wall: readonly WallStory[];
  /** Everything he has made, for "View collection" on the wall. Empty until real photographs and prices are supplied. */
  readonly collection: readonly CollectionPiece[];
  readonly experience: { readonly greetingEnabled: boolean; readonly soundDefault: boolean };
}

export const STORE_EVENTS = [
  "store_loaded",
  "door_entered",
  "greeting_started",
  "greeting_completed",
  "browse_started",
  "product_viewed",
  "product_swiped",
  "product_selected",
  "builder_started",
  "greeting_choice",
  "look_around_started",
  "story_opened",
  "collection_opened",
] as const;
export type StoreEvent = (typeof STORE_EVENTS)[number];
