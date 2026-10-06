"use client";

import gsap from "gsap";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AnimationMixer, Box3, CanvasTexture, LoopOnce, MathUtils, Mesh, MeshStandardMaterial, SkinnedMesh, Vector3, type AnimationAction, type Group } from "three";
import { useGltf } from "./use-gltf";
import { useScene } from "./scene-store";
import type { WorldProps } from "./types";

const HEIGHT = 1.76; // metres. TODO(owner): confirm Jesse's height.
const facing = (from: Vector3, to: Vector3): number => Math.atan2(to.x - from.x, to.z - from.z);

/**
 * Part 3: Jesse. He is in the room the whole time: at the bench when the visitor walks in, a step forward to greet, then aside by the wall,
 * turning towards whatever the visitor is looking at.
 *
 * INTERIM LOOK: drawn as a dark silhouette. The character model is not owner-approved yet (docs/LOCKED-DECISIONS.md), so no face is shown.
 * The model has no mouth shapes and no wave or point clips yet, so the greeting uses his turn, step and nod; lip sync is wired (experience/lip-sync.ts)
 * and starts working when a model with mouth shapes and a recorded line are supplied.
 */
export function Jesse({ bootstrap, stage, index, returning, reducedMotion }: WorldProps) {
  const gltf = useGltf(stage === "boot" ? null : bootstrap.scene.jesse);
  const anchors = useScene((s) => s.anchors);
  const camera = useThree((s) => s.camera);
  const root = useRef<Group>(null);
  const targetYaw = useRef(Math.PI / 2);

  const rig = useMemo(() => {
    if (!gltf) return null;
    const silhouette = new MeshStandardMaterial({ color: "#0c0a09", roughness: 1, metalness: 0 });
    gltf.scene.traverse((o) => {
      if (o instanceof Mesh) {
        o.material = silhouette;
        o.frustumCulled = false; // skinned meshes are culled by their rest pose otherwise
      }
    });
    // A skinned figure's size comes from its bones, not its raw vertices: measure the posed meshes.
    gltf.scene.updateMatrixWorld(true);
    const bounds = new Box3();
    gltf.scene.traverse((o) => {
      if (o instanceof SkinnedMesh) {
        o.computeBoundingBox();
        if (o.boundingBox) bounds.union(o.boundingBox.clone().applyMatrix4(o.matrixWorld));
      }
    });
    const size = bounds.isEmpty() ? new Vector3(0, HEIGHT, 0) : bounds.getSize(new Vector3());
    const plausible = size.y > 1.2 && size.y < 2.4; // otherwise trust the file's own scale
    const mixer = new AnimationMixer(gltf.scene);
    const actions = new Map<string, AnimationAction>(gltf.animations.map((clip) => [clip.name, mixer.clipAction(clip)]));
    return { scale: plausible ? HEIGHT / size.y : 1, mixer, actions };
  }, [gltf]);

  // Start at the bench, working, side-on to the door.
  useEffect(() => {
    const bench = anchors.get("JESSE_BENCH");
    if (!rig || !root.current || !bench) return;
    root.current.position.copy(bench);
    root.current.rotation.y = targetYaw.current = Math.PI / 2;
    rig.actions.get("idle")?.reset().play();
    return () => {
      rig.mixer.stopAllAction();
    };
  }, [rig, anchors]);

  // The greeting, then stepping aside (spec timeline: look 0.2s, step 0.8s, speak 1.1s, gesture to the wall 3.5s).
  useEffect(() => {
    const g = root.current;
    if (!rig || !g) return;
    const walk = rig.actions.get("walk");
    const idle = rig.actions.get("idle");
    const nod = rig.actions.get("agree");
    const stepTo = (tl: gsap.core.Timeline, to: Vector3, at: number, seconds: number): void => {
      if (reducedMotion) {
        tl.set(g.position, { x: to.x, z: to.z }, at);
        return;
      }
      tl.call(() => void walk?.reset().fadeIn(0.15).play(), undefined, at);
      tl.to(g.position, { x: to.x, z: to.z, duration: seconds, ease: "sine.inOut" }, at);
      tl.call(() => void (walk?.fadeOut(0.2), idle?.reset().fadeIn(0.2).play()), undefined, at + seconds);
    };
    const tl = gsap.timeline();
    if (stage === "greeting") {
      const greet = anchors.get("JESSE_GREET");
      tl.call(() => void (targetYaw.current = facing(g.position, camera.position)), undefined, 0.2);
      if (greet && !returning) stepTo(tl, greet, 0.8, 0.7);
      if (nod) tl.call(() => void (nod.reset().setLoop(LoopOnce, 1).fadeIn(0.15).play(), nod.fadeOut(0.3).startAt(rig.mixer.time + 1.4)), undefined, returning ? 0.5 : 1.6);
      const wall = anchors.get("PRODUCT_GLOVES");
      if (wall) tl.call(() => void (targetYaw.current = facing(g.position, wall)), undefined, returning ? 1.4 : 3.5);
    } else if (stage === "browsing" || stage === "productSelected") {
      const aside = anchors.get("JESSE_ASIDE");
      if (aside && g.position.distanceTo(aside) > 0.2) {
        tl.call(() => void (targetYaw.current = facing(g.position, aside)), undefined, 0);
        stepTo(tl, aside, 0.15, 1.3);
      }
      if (stage === "productSelected" && nod) tl.call(() => void nod.reset().setLoop(LoopOnce, 1).fadeIn(0.15).play(), undefined, 0.3);
    }
    return () => {
      tl.kill();
    };
  }, [stage, rig, anchors, camera, returning, reducedMotion]);

  // While the visitor browses he glances towards the product in view. He does not speak: a reaction on every swipe would grate.
  useEffect(() => {
    const g = root.current;
    const product = bootstrap.products[index];
    const mark = product ? anchors.get(`PRODUCT_${product.cameraAnchor}`) : undefined;
    if (!g || !mark || stage !== "browsing") return;
    const id = setTimeout(() => void (targetYaw.current = facing(g.position, mark)), 1500);
    return () => clearTimeout(id);
  }, [index, stage, anchors, bootstrap.products]);

  useFrame((_, dt) => {
    rig?.mixer.update(dt);
    const g = root.current;
    if (!g) return;
    const delta = Math.atan2(Math.sin(targetYaw.current - g.rotation.y), Math.cos(targetYaw.current - g.rotation.y));
    g.rotation.y += delta * (1 - Math.exp(-dt * 5));
    g.rotation.y = MathUtils.euclideanModulo(g.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
  });

  // He moves, so the room's baked shadows cannot include his. A soft dark patch on the floor under him stands in for it (specs/09): it follows his
  // feet because it sits inside his own group. It is a patch, not a figure-shaped shadow, and nothing about the model itself is touched.
  const patch = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (g) {
      const fade = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      fade.addColorStop(0, "rgb(0 0 0 / 0.5)");
      fade.addColorStop(0.55, "rgb(0 0 0 / 0.22)");
      fade.addColorStop(1, "rgb(0 0 0 / 0)");
      g.fillStyle = fade;
      g.fillRect(0, 0, 128, 128);
    }
    return new CanvasTexture(c);
  }, []);
  useEffect(() => () => patch.dispose(), [patch]);

  if (!gltf || !rig) return null;
  return (
    <group ref={root}>
      <primitive object={gltf.scene} scale={rig.scale} />
      <mesh rotation-x={-Math.PI / 2} position-y={0.016} scale={[1.15, 0.9, 1]} renderOrder={1}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial map={patch} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
