"use client";

import gsap from "gsap";
import { useEffect, useMemo } from "react";
import { assetManager } from "@/experience/asset-manager";
import { useGltf } from "./use-gltf";
import { INSIDE, type WorldProps } from "./types";

/** Part 1: the shop front. The door is its own node, hinged on its left edge, and swings in when the visitor taps to enter. */
export function Exterior({ bootstrap, stage, reducedMotion }: WorldProps) {
  const inside = INSIDE.has(stage);
  const gltf = useGltf(inside ? null : bootstrap.scene.exterior);
  const door = useMemo(() => gltf?.scene.getObjectByName("DOOR") ?? null, [gltf]);

  useEffect(() => {
    if (!door || stage !== "entering") return;
    const tween = gsap.to(door.rotation, { y: 1.75, duration: reducedMotion ? 0 : 1.15, ease: "power2.out" });
    return () => {
      tween.kill();
    };
  }, [door, stage, reducedMotion]);

  // Once the visitor is in the workshop the street is no longer drawn, and its memory is handed back.
  useEffect(() => {
    if (inside) assetManager.release(bootstrap.scene.exterior);
  }, [inside, bootstrap.scene.exterior]);

  if (!gltf || inside) return null;
  return <primitive object={gltf.scene} />;
}
