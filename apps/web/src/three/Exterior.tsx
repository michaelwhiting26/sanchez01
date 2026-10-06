"use client";

import gsap from "gsap";
import { useEffect, useMemo } from "react";
import { assetManager } from "@/experience/asset-manager";
import { useGltf } from "./use-gltf";
import { INSIDE, type WorldProps } from "./types";

/** How far each leaf swings into the room, in radians. */
const OPEN = 1.75;

/** Part 1: the shop front. The door is a pair of leaves, each its own node hinged on its outer edge (DOOR on the left, DOOR_R on the right); both swing in when the visitor taps to enter. */
export function Exterior({ bootstrap, stage, reducedMotion }: WorldProps) {
  const inside = INSIDE.has(stage);
  const gltf = useGltf(inside ? null : bootstrap.scene.exterior);
  const leaves = useMemo(() => {
    if (!gltf) return [];
    const left = gltf.scene.getObjectByName("DOOR");
    const right = gltf.scene.getObjectByName("DOOR_R");
    return [...(left ? [{ leaf: left, open: OPEN }] : []), ...(right ? [{ leaf: right, open: -OPEN }] : [])];
  }, [gltf]);

  useEffect(() => {
    if (leaves.length === 0 || stage !== "entering") return;
    const tweens = leaves.map(({ leaf, open }) => gsap.to(leaf.rotation, { y: open, duration: reducedMotion ? 0 : 1.15, ease: "power2.out" }));
    return () => {
      for (const tween of tweens) tween.kill();
    };
  }, [leaves, stage, reducedMotion]);

  // Once the visitor is in the workshop the street is no longer drawn, and its memory is handed back.
  useEffect(() => {
    if (inside) assetManager.release(bootstrap.scene.exterior);
  }, [inside, bootstrap.scene.exterior]);

  if (!gltf || inside) return null;
  return <primitive object={gltf.scene} />;
}
