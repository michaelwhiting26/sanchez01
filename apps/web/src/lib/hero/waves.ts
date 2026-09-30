import { WAVES } from "./config";

/** Deterministic pseudo-random in [0, 1) from a number: exactly the prototype's hash (JS `%` keeps the sign, so the absolute value is taken after it). */
export const hash1 = (v: number): number => Math.abs((Math.sin(v) * 43758.5453) % 1);

/**
 * Fill one quarter's wave table: a set of seven crests rolling outward, each with its own strength.
 * `tables[q]` is a 1-D table over distance (half-cell steps). Pure and deterministic, so it can be tested.
 */
export function fillWaveTables(tables: readonly Float32Array[], seconds: number, reduce: boolean): void {
  const { count, bins, width, envelope, quarters } = WAVES;
  for (let q = 0; q < quarters.length; q++) {
    const table = tables[q];
    const quarter = quarters[q];
    if (!table || !quarter) continue;
    table.fill(0);
    const t = seconds + quarter.offset;
    if (reduce || t <= 0) continue;
    const setIndex = Math.floor(t / quarter.period);
    const local = t - setIndex * quarter.period;
    for (let k = 0; k < count; k++) {
      const jitter = hash1((setIndex + 3 + q * 7) * 12.9898 + k * 78.233);
      const strength = (envelope[k] ?? 0) * (0.72 + 0.5 * jitter) * quarter.strength;
      const crest = local * quarter.speed - k * quarter.gap;
      if (crest < -width * 3 || crest > bins / 2 + width * 3) continue;
      const from = Math.max(0, Math.floor((crest - width * 3) * 2));
      const to = Math.min(bins, Math.ceil((crest + width * 3) * 2));
      for (let bin = from; bin <= to; bin++) {
        const d = bin / 2 - crest;
        table[bin] = (table[bin] ?? 0) + strength * Math.exp(-(d * d) / (width * width));
      }
    }
  }
}

export function createWaveTables(): Float32Array[] {
  return WAVES.quarters.map(() => new Float32Array(WAVES.bins + 1));
}
