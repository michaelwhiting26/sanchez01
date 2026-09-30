import { FLAG_MAP, FLAG_PALETTE, FLAG_SOURCE, type Rgb } from "./config";

function paletteColour(index: number): Rgb {
  return FLAG_PALETTE[index] ?? FLAG_PALETTE[0] ?? [0, 0, 0];
}

/**
 * Quantise RGBA pixels to the nearest flag palette index (0 navy, 1 red, 2 white).
 * Pure so it can be unit-tested without a canvas.
 */
export function quantiseFlag(rgba: ArrayLike<number>, pixels: number): Uint8Array {
  const out = new Uint8Array(pixels);
  for (let q = 0; q < pixels; q++) {
    const r = rgba[q * 4] ?? 0;
    const g = rgba[q * 4 + 1] ?? 0;
    const b = rgba[q * 4 + 2] ?? 0;
    let best = 0;
    let bestDist = Infinity;
    for (let p = 0; p < FLAG_SOURCE.length; p++) {
      const s = FLAG_SOURCE[p];
      if (!s) continue;
      const d = (r - s[0]) ** 2 + (g - s[1]) ** 2 + (b - s[2]) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    out[q] = best;
  }
  return out;
}

/** The flag laid over the word: palette index at normalised (u, v). Before the raster loads, a plain fallback split is used. */
export class FlagLookup {
  private indices: Uint8Array | null = null;

  set(indices: Uint8Array): void {
    this.indices = indices;
  }

  /** Palette index at a normalised position (0..1 both axes). */
  at(u: number, v: number): number {
    const idx = this.indices;
    if (!idx) return u < 0.5 ? 0 : v < 0.5 ? 1 : 2;
    const { width, height } = FLAG_MAP;
    const fx = Math.min(width - 1, Math.max(0, Math.round(u * (width - 1))));
    const fy = Math.min(height - 1, Math.max(0, Math.round(v * (height - 1))));
    return idx[fy * width + fx] ?? 0;
  }

  colour(u: number, v = 0.5): Rgb {
    return paletteColour(this.at(u, v));
  }
}

/** Load the official flag artwork, down-sample it, and quantise it. Resolves null if the image or canvas readback is unavailable. */
export async function loadFlagIndices(): Promise<Uint8Array | null> {
  const { width, height, src } = FLAG_MAP;
  const image = new Image();
  image.decoding = "async";
  const loaded = new Promise<boolean>((resolve) => {
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
  });
  image.src = src;
  if (!(await loaded)) return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, width, height);
  try {
    return quantiseFlag(ctx.getImageData(0, 0, width, height).data, width * height);
  } catch {
    return null; // tainted canvas: the fallback split is used
  }
}
