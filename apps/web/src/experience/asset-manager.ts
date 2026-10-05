import type { Material, Object3D, Texture } from "three";
import { Mesh } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/**
 * Loads and frees the store's 3D files. One loader, one cache: a file asked for twice downloads once, and `release` gives the memory back
 * (the street scene is dropped once the visitor is inside). Decoders are served from this site, never a third-party CDN.
 */
class AssetManager {
  private loader: GLTFLoader | null = null;
  private readonly cache = new Map<string, Promise<GLTF>>();

  private get gltf(): GLTFLoader {
    if (!this.loader) {
      const draco = new DRACOLoader();
      draco.setDecoderPath("/vendor/draco/");
      this.loader = new GLTFLoader();
      this.loader.setDRACOLoader(draco);
      this.loader.setMeshoptDecoder(MeshoptDecoder);
    }
    return this.loader;
  }

  load(url: string): Promise<GLTF> {
    let hit = this.cache.get(url);
    if (!hit) {
      hit = this.gltf.loadAsync(url);
      this.cache.set(url, hit);
      hit.catch(() => this.cache.delete(url)); // a failed download can be retried
    }
    return hit;
  }

  preload(urls: readonly string[]): void {
    for (const url of urls) void this.load(url).catch(() => undefined);
  }

  release(url: string): void {
    const hit = this.cache.get(url);
    if (!hit) return;
    this.cache.delete(url);
    void hit.then((g) => disposeObject(g.scene)).catch(() => undefined);
  }
}

export function disposeObject(root: Object3D): void {
  root.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    (o.geometry as { dispose(): void }).dispose();
    const mats: Material[] = Array.isArray(o.material) ? (o.material as Material[]) : [o.material as Material];
    for (const m of mats) {
      for (const value of Object.values(m)) if (isTexture(value)) value.dispose();
      m.dispose();
    }
  });
}

function isTexture(v: unknown): v is Texture {
  return typeof v === "object" && v !== null && (v as { isTexture?: boolean }).isTexture === true;
}

export const assetManager = new AssetManager();
