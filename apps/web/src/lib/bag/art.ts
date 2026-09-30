/**
 * Bag artwork. "tigerfull" is drawn on a canvas (white back, red front carrying the enlarged tiger picture); the four luxury wraps are finished
 * full-wrap textures under /assets/bag3d/lux with a matching relief/roughness/metal map. The procedural configurator-only artworks (embroidered
 * tiger, fractal hexagons, UV test) are not part of the home page and are not ported here.
 */
import type { BagArtKey } from "./products";

const TIGER_SRC = "/assets/bag3d/tiger-hd.jpg"; // the sharper enlarged tiger, for this bag only (the configurator keeps tiger.png)
const LUX_BASE = "/assets/bag3d/lux";

export interface BagArt {
  /** Draw the artwork; `refresh` is called once the picture has loaded so the GPU texture can update. */
  draw(width: number, height: number, refresh: () => void): HTMLCanvasElement;
  /** Relief/roughness/metal map (R = relief, G = roughness, B = metal) for the luxury wraps. */
  readonly rm?: string;
}

function canvas(w: number, h: number): { c: HTMLCanvasElement; g: CanvasRenderingContext2D } {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) throw new Error("bag art: 2D canvas unavailable");
  return { c, g };
}

function tigerFull(w: number, h: number, refresh: () => void): HTMLCanvasElement {
  const { c, g } = canvas(w, h);
  g.fillStyle = "#f7f7f2";
  g.fillRect(0, 0, w, h); // white half
  g.fillStyle = "#b4402e";
  g.fillRect(w / 4, 0, w / 2, h); // red half = the FRONT (u 0.25 to 0.75)
  const im = new Image();
  im.onload = () => {
    const hw = w / 2;
    const k = Math.max(hw / im.naturalWidth, h / im.naturalHeight);
    const dw = im.naturalWidth * k;
    const dh = im.naturalHeight * k;
    g.save();
    g.beginPath();
    g.rect(w / 4, 0, hw, h);
    g.clip();
    g.imageSmoothingQuality = "high";
    g.drawImage(im, w / 4 + (hw - dw) / 2, (h - dh) / 2, dw, dh);
    g.restore();
    refresh();
  };
  im.src = TIGER_SRC;
  return c;
}

function lux(name: string, back: string): BagArt {
  return {
    rm: `${LUX_BASE}/${name}-rm.jpg`,
    draw(w, h, refresh) {
      const { c, g } = canvas(w, h);
      g.fillStyle = back;
      g.fillRect(0, 0, w, h);
      const im = new Image();
      im.onload = () => {
        g.imageSmoothingQuality = "high";
        g.drawImage(im, 0, 0, w, h);
        refresh();
      };
      im.src = `${LUX_BASE}/${name}-albedo.jpg`;
      return c;
    },
  };
}

export const BAG_ART: Record<BagArtKey, BagArt> = {
  tigerfull: { draw: tigerFull },
  monogram: lux("monogram", "#0b0b0c"),
  dragonfull: lux("dragon", "#090808"),
  koifull: lux("koi", "#102a44"),
  kintsugi: lux("kintsugi", "#0b0b0c"),
};
