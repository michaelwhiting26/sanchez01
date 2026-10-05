import type { Vector3 } from "three";
import { create } from "zustand";

/** Short-lived scene state that is not a navigation decision: the marks read from the Blender files, and the current quality level. */
export interface SceneState {
  /** Named marks from the GLB files (CAM_*, LOOK_*, PRODUCT_*, JESSE_*), in world space. */
  anchors: ReadonlyMap<string, Vector3>;
  workshopReady: boolean;
  /** 0 = full, 1 = reduced (lower resolution, no dust). Set by LODController when the frame rate drops. */
  qualityTier: 0 | 1;
  dpr: number;
  setAnchors: (anchors: ReadonlyMap<string, Vector3>) => void;
  setQuality: (tier: 0 | 1, dpr: number) => void;
}

export const useScene = create<SceneState>((set) => ({
  anchors: new Map(),
  workshopReady: false,
  qualityTier: 0,
  dpr: 1.5,
  setAnchors: (anchors) => set({ anchors, workshopReady: true }),
  setQuality: (qualityTier, dpr) => set({ qualityTier, dpr }),
}));
