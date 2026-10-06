import { SRGBColorSpace, TextureLoader, type Texture } from "three";

/**
 * Baked light for a room (specs/09): one picture, ray-traced in Blender by tools/store/bake_light.py, that holds the room's light and shadow.
 * A picture asked for twice downloads once.
 *
 * Two views of the same picture are handed out, because a surface keeps its light layout in one of two places: surfaces with a tiling texture
 * carry it as their second layout, plain-coloured surfaces as their only one. Both views share one upload to the graphics card.
 */
export interface LightMap {
  /** For surfaces whose light layout is their second set of coordinates. */
  readonly second: Texture;
  /** For surfaces whose light layout is their only set. */
  readonly only: Texture;
}

const cache = new Map<string, Promise<LightMap>>();

export function loadLightMap(url: string): Promise<LightMap> {
  let hit = cache.get(url);
  if (!hit) {
    hit = new TextureLoader().loadAsync(url).then((second) => {
      second.flipY = false; // laid out the way the 3D file's coordinates run, like the textures inside the file
      second.colorSpace = SRGBColorSpace; // stored sRGB-encoded for finer steps in the dark end; decoded back to linear light on load
      second.channel = 1;
      const only = second.clone();
      only.channel = 0;
      return { second, only };
    });
    cache.set(url, hit);
    hit.catch(() => cache.delete(url)); // a failed download can be retried
  }
  return hit;
}
