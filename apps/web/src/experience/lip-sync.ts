import type { Viseme } from "@/lib/storefront/types";

/**
 * Lip sync from prepared timings (spec Part 3): every recorded line ships with its visemes; nothing is analysed live.
 * Returns the viseme in force at `time`, eased out so the mouth closes between sounds, or null when the mouth should rest.
 */
export function findCurrentViseme(time: number, visemes: readonly Viseme[], holdSeconds = 0.12): Viseme | null {
  let active: Viseme | null = null;
  for (const v of visemes) {
    if (v.t > time) break;
    active = v;
  }
  if (!active) return null;
  const age = time - active.t;
  if (age > holdSeconds) return null;
  return { ...active, weight: active.weight * (1 - age / holdSeconds) };
}

export interface MorphFace {
  /** Sets one mouth shape's weight; unknown shapes are ignored by the implementation. */
  setMorph(shape: string, weight: number): void;
  resetMouth(): void;
}

export function updateLipSync(time: number, visemes: readonly Viseme[], face: MorphFace): void {
  const active = findCurrentViseme(time, visemes);
  face.resetMouth();
  if (active) face.setMorph(active.shape, active.weight);
}
