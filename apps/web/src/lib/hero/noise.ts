import { createNoise3D, type NoiseFunction3D } from "simplex-noise";

/** Small seeded PRNG (mulberry32) so the noise, and therefore the look, is identical on every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a, the same seed hash the fingerprint uses. */
export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type Noise3 = NoiseFunction3D;

export function createSeededNoise(seed: string): Noise3 {
  return createNoise3D(mulberry32(hashSeed(seed)));
}

/** Two octaves of simplex noise, in roughly [-1, 1]. Used for the clouds. */
export function fbm3(noise: Noise3, a: number, b: number, c: number): number {
  return 0.62 * noise(a, b, c) + 0.38 * noise(a * 2.3 + 9, b * 2.3, c * 1.6);
}
