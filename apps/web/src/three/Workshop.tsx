"use client";

import { useEffect } from "react";
import { Vector3 } from "three";
import { useGltf } from "./use-gltf";
import { useScene } from "./scene-store";
import type { WorldProps } from "./types";

const MARK = /^(CAM_|LOOK_|PRODUCT_|JESSE_)/;

/**
 * The workshop shell and fixtures. It also carries the marks placed in Blender (camera standing points, where each product hangs, where Jesse stands):
 * they are read here once and published, so composition is changed in the 3D file, not in code.
 */
export function Workshop({ bootstrap }: WorldProps) {
  const gltf = useGltf(bootstrap.scene.workshop);
  const setAnchors = useScene((s) => s.setAnchors);

  useEffect(() => {
    if (!gltf) return;
    gltf.scene.updateMatrixWorld(true);
    const marks = new Map<string, Vector3>();
    gltf.scene.traverse((o) => {
      if (MARK.test(o.name)) marks.set(o.name, o.getWorldPosition(new Vector3()));
    });
    setAnchors(marks);
  }, [gltf, setAnchors]);

  return gltf ? <primitive object={gltf.scene} /> : null;
}
