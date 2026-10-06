"use client";

import { useEffect, useState } from "react";
import { Mesh, MeshStandardMaterial, SRGBColorSpace, TextureLoader, Vector3 } from "three";
import { loadLightMap, type LightMap } from "@/experience/light-map";
import { COLLECTION_WALL_TILES } from "@/lib/storefront/config";
import { useGltf } from "./use-gltf";
import { useScene } from "./scene-store";
import type { WorldProps } from "./types";

const MARK = /^(CAM_|LOOK_|PRODUCT_|JESSE_)/;
/** How strongly a plain (non-metal) baked surface mirrors the studio-style reflection map. Its light now comes from the bake, not from that map. */
const BAKED_REFLECTION = 0.25;

/**
 * The workshop shell and fixtures. It also carries the marks placed in Blender (camera standing points, where each product hangs, where Jesse stands):
 * they are read here once and published, so composition is changed in the 3D file, not in code.
 *
 * Everything in this file is fixed in place, so its light and shadow are baked: ray-traced once in Blender and laid over the room as a picture
 * (specs/09). The picture is attached here because the 3D file format has no slot of its own for baked light.
 */
export function Workshop({ bootstrap }: WorldProps) {
  const gltf = useGltf(bootstrap.scene.workshop);
  const setAnchors = useScene((s) => s.setAnchors);
  const [light, setLight] = useState<LightMap | null>(null);

  useEffect(() => {
    let live = true;
    void loadLightMap(bootstrap.scene.workshopLight)
      .then((map) => live && setLight(map))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [bootstrap.scene.workshopLight]);

  useEffect(() => {
    if (!gltf) return;
    gltf.scene.updateMatrixWorld(true);
    const marks = new Map<string, Vector3>();
    gltf.scene.traverse((o) => {
      if (MARK.test(o.name)) marks.set(o.name, o.getWorldPosition(new Vector3()));
    });
    setAnchors(marks);
  }, [gltf, setAnchors]);

  // Lay the baked light over every fixed surface. Glowing parts (bulbs, light strips) carry no coordinates and are left alone.
  useEffect(() => {
    if (!gltf || !light) return;
    // The bake stores light divided by `scale` so it fits in 8 bits. Blender's lighting-only bake is already divided by pi and three.js divides
    // baked light by pi again when shading, so the picture goes on at pi times that scale. Arithmetic, not a look chosen by eye.
    const scale = Number(gltf.scene.getObjectByName("LIGHTMAP")?.userData.scale ?? 1);
    gltf.scene.traverse((o) => {
      if (!(o instanceof Mesh) || !(o.material instanceof MeshStandardMaterial)) return;
      const geometry = o.geometry as Mesh["geometry"];
      if (!geometry.hasAttribute("uv")) return;
      o.material.lightMap = geometry.hasAttribute("uv1") ? light.second : light.only;
      o.material.lightMapIntensity = Math.PI * scale;
      if (o.material.metalness < 0.5) o.material.envMapIntensity = BAKED_REFLECTION;
      o.material.needsUpdate = true;
      o.receiveShadow = true; // for the one live shadow in the room: the product on show, onto its counter
    });
  }, [gltf, light]);

  // The collection display on Jesse's wall: each tile is its own piece of the room, and takes the photograph of the piece in that place in the
  // collection list. With an empty list the tiles stay plain. Photographs sit under the room's baked light like any other surface.
  useEffect(() => {
    if (!gltf) return;
    let live = true;
    const loader = new TextureLoader();
    for (const [i, piece] of bootstrap.collection.slice(0, COLLECTION_WALL_TILES).entries()) {
      const tile = gltf.scene.getObjectByName(`COLLECTION_TILE_${i}`);
      if (!(tile instanceof Mesh) || !(tile.material instanceof MeshStandardMaterial)) continue;
      const material = tile.material;
      void loader
        .loadAsync(piece.photo)
        .then((photo) => {
          if (!live) return;
          photo.flipY = false;
          photo.colorSpace = SRGBColorSpace;
          material.map = photo;
          material.color.set("#ffffff");
          material.needsUpdate = true;
        })
        .catch(() => undefined);
    }
    return () => {
      live = false;
    };
  }, [gltf, bootstrap.collection]);

  return gltf ? <primitive object={gltf.scene} /> : null;
}
