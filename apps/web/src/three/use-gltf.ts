import { useEffect, useState } from "react";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { assetManager } from "@/experience/asset-manager";

/** Loads a GLB through the shared asset manager. Returns null until it arrives (the scene simply shows it when ready: no loading screen). */
export function useGltf(url: string | null): GLTF | null {
  const [loaded, setLoaded] = useState<{ url: string; gltf: GLTF } | null>(null);
  useEffect(() => {
    if (!url) return;
    let live = true;
    assetManager
      .load(url)
      .then((gltf) => {
        if (live) setLoaded({ url, gltf });
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [url]);
  return loaded && loaded.url === url ? loaded.gltf : null;
}
