import type { StoreBootstrap } from "@/lib/storefront/types";
import type { StoreEventObject, StoreStage } from "@/experience/store-machine";

/** What every 3D component is told. They read the stage; only `send` changes it. */
export interface WorldProps {
  readonly bootstrap: StoreBootstrap;
  readonly stage: StoreStage;
  readonly index: number;
  readonly returning: boolean;
  readonly reducedMotion: boolean;
  readonly send: (event: StoreEventObject) => void;
  /** The visitor tapped something on the wall while looking around: open its story over the store. */
  readonly onOpenStory: (id: string) => void;
}

export const INSIDE: ReadonlySet<StoreStage> = new Set<StoreStage>(["greeting", "browsing", "lookingAround", "productSelected", "builderLoading"]);
