"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AnimationMixer, Bone, Box3, LoopOnce, LoopRepeat, MathUtils, Mesh, MeshStandardMaterial, Quaternion, SkinnedMesh, Vector3, type AnimationAction, type Group, type Object3D, type Skeleton } from "three";
import type { StoreStage } from "@/experience/store-machine";
import { attentionFor, hasSeatedClips, HEAD_DOWN, HEAD_UP, jointKey, seatedClipFor, SEATED_HIP_HEIGHT, SEWING_POSE, type SeatedClip } from "./jesse-pose";
import { useFloorPatch } from "./use-floor-patch";
import { useGltf } from "./use-gltf";
import { useScene } from "./scene-store";
import type { WorldProps } from "./types";

const HEIGHT = 1.76; // metres, standing. TODO(owner): confirm Jesse's height.
const UP = new Vector3(0, 1, 0);

/** Each skeleton's rest pose, recorded the first time it is seen. */
const REST = new WeakMap<Skeleton, Array<{ p: Vector3; q: Quaternion; s: Vector3 }>>();

interface Joint {
  readonly bone: Bone;
  readonly key: string;
  /** Index of its parent in the list, or -1 for the first. Parents always come before their children. */
  readonly parent: number;
  readonly restLocal: Quaternion;
  /** Its rotation at rest, in the character's own space. */
  readonly restModel: Quaternion;
  /** Which way it points at rest (towards its first child), in the character's own space. Null for a joint with nothing after it. */
  readonly restDir: Vector3 | null;
}

/**
 * Jesse at his sewing machine (specs/10, 6 Oct 2026). He is sitting there, sewing, from the moment the street is in view; when the visitor
 * stops in front of him he looks up, and when they have answered he nods and gets back to it. He glances at whatever they are looking at.
 * He never stands or walks.
 *
 * A finished character with the five seated clips (jesse-pose.ts) is simply played. The stand-in has none, so its joints are aimed in code.
 * INTERIM LOOK: a dark silhouette, as before: no character is owner-approved yet (docs/LOCKED-DECISIONS.md).
 */
export function JesseSeated({ bootstrap, stage, index, reducedMotion, seat, hands }: Omit<WorldProps, "onOpenStory"> & { seat: Vector3; hands: Vector3 }) {
  const gltf = useGltf(stage === "boot" ? null : bootstrap.scene.jesse);
  const anchors = useScene((s) => s.anchors);
  const root = useRef<Group>(null);
  const patch = useFloorPatch();
  const attention = useRef(0); // 0 = eyes on the work, 1 = eyes on the visitor
  const attentionTarget = useRef(0);
  const glance = useRef({ weight: 0, target: 0, yaw: 0 });
  const nod = useRef(0);
  const yaw = Math.atan2(hands.x - seat.x, hands.z - seat.z); // he faces his machine

  const rig = useMemo(() => {
    if (!gltf) return null;
    const silhouette = new MeshStandardMaterial({ color: "#0c0a09", roughness: 1, metalness: 0 });
    let skinned: SkinnedMesh | null = null;
    gltf.scene.traverse((o) => {
      if (o instanceof Mesh) {
        o.material = silhouette;
        o.frustumCulled = false; // skinned meshes are culled by their rest pose otherwise
      }
      if (o instanceof SkinnedMesh && !skinned) skinned = o;
    });
    const body = skinned as SkinnedMesh | null;
    if (!body) return null;
    // Start from the rest pose, whatever an earlier mount left the joints in. The rest pose is recorded the first time this figure is seen
    // and put back from that record. (three's own Skeleton.pose() is not used: on a skeleton authored in centimetres under a 1/100 scale,
    // as this one is, it applies that scale a second time and the figure collapses to a point.)
    let rest = REST.get(body.skeleton);
    if (!rest) {
      rest = body.skeleton.bones.map((b) => ({ p: b.position.clone(), q: b.quaternion.clone(), s: b.scale.clone() }));
      REST.set(body.skeleton, rest);
    }
    for (const [i, b] of body.skeleton.bones.entries()) {
      const r = rest[i];
      if (!r) continue;
      b.position.copy(r.p);
      b.quaternion.copy(r.q);
      b.scale.copy(r.s);
    }
    gltf.scene.updateMatrixWorld(true);

    // Everything below is measured in the character's own space, so it does not matter where the figure has been placed in the room.
    const toModel = gltf.scene.getWorldQuaternion(new Quaternion()).invert();
    const bones = body.skeleton.bones;
    const at = new Map<Object3D, number>(bones.map((b, i) => [b, i]));
    const joints: Joint[] = bones.map((bone) => {
      const child = bone.children.find((c): c is Bone => c instanceof Bone);
      let restDir: Vector3 | null = null;
      if (child) {
        restDir = gltf.scene.worldToLocal(child.getWorldPosition(new Vector3())).sub(gltf.scene.worldToLocal(bone.getWorldPosition(new Vector3())));
        restDir = restDir.lengthSq() > 1e-10 ? restDir.normalize() : null;
      }
      return {
        bone,
        key: jointKey(bone.name),
        parent: bone.parent ? (at.get(bone.parent) ?? -1) : -1,
        restLocal: bone.quaternion.clone(),
        restModel: toModel.clone().multiply(bone.getWorldQuaternion(new Quaternion())),
        restDir,
      };
    });
    const hips = joints.find((j) => j.key === "Hips");
    const hipHeight = hips ? gltf.scene.worldToLocal(hips.bone.getWorldPosition(new Vector3())).y : 1;

    const bounds = new Box3();
    gltf.scene.traverse((o) => {
      if (o instanceof SkinnedMesh) {
        o.computeBoundingBox();
        if (o.boundingBox) bounds.union(o.boundingBox.clone().applyMatrix4(o.matrixWorld));
      }
    });
    const tall = bounds.isEmpty() ? HEIGHT : bounds.getSize(new Vector3()).y / gltf.scene.getWorldScale(new Vector3()).y;
    const scale = tall > 1.2 && tall < 2.4 ? HEIGHT / tall : 1; // otherwise trust the file's own scale

    const mixer = new AnimationMixer(gltf.scene);
    const actions = new Map<string, AnimationAction>(gltf.animations.map((clip) => [clip.name, mixer.clipAction(clip)]));
    return { joints, hipHeight, scale, mixer, actions, clips: hasSeatedClips(actions.keys()), now: joints.map(() => new Quaternion()) };
  }, [gltf]);

  // A finished character: play its own clips. Sewing is the default; looking up, nodding and returning are chained on top.
  const previous = useRef<StoreStage>("boot");
  useEffect(() => {
    if (!rig?.clips) return;
    const play = (name: SeatedClip, once: boolean): AnimationAction | undefined => {
      const action = rig.actions.get(name);
      if (!action) return undefined;
      action.reset().setLoop(once ? LoopOnce : LoopRepeat, once ? 1 : Infinity);
      action.clampWhenFinished = once;
      action.fadeIn(0.3).play();
      for (const [other, a] of rig.actions) if (other !== name && a.isRunning()) a.fadeOut(0.3);
      return action;
    };
    const was = previous.current;
    previous.current = stage;
    const first = seatedClipFor(stage, was);
    const chain: SeatedClip[] = first === "sit_look_up" ? ["sit_look_up", "sit_idle"] : first === "sit_nod" ? ["sit_nod", "sit_return", "sit_sew"] : was === "boot" ? ["sit_sew"] : [];
    if (chain.length === 0) return;
    let step = 0;
    const next = (): void => {
      const name = chain[step++];
      if (name) play(name, step < chain.length);
    };
    const onFinished = (): void => next();
    rig.mixer.addEventListener("finished", onFinished);
    next();
    return () => rig.mixer.removeEventListener("finished", onFinished);
  }, [rig, stage]);

  // The stand-in: when he looks up, when he nods, and what he glances at.
  useEffect(() => {
    const id = setTimeout(() => void (attentionTarget.current = attentionFor(stage)), stage === "greeting" ? 200 : 0);
    if (stage === "productSelected" || stage === "browsing" || stage === "lookingAround") nod.current = 1;
    return () => clearTimeout(id);
  }, [stage]);
  useEffect(() => {
    const product = bootstrap.products[index];
    const mark = product ? anchors.get(`PRODUCT_${product.cameraAnchor}`) : undefined;
    if (stage !== "browsing" || !mark) {
      glance.current.target = 0;
      return;
    }
    // Which way that product is, turned into "how far round from straight ahead" for him. He only turns his head so far.
    const round = Math.atan2(mark.x - seat.x, mark.z - seat.z) - yaw;
    glance.current.yaw = MathUtils.clamp(Math.atan2(Math.sin(round), Math.cos(round)), -1.1, 1.1);
    const look = setTimeout(() => void (glance.current.target = 1), 1300);
    const back = setTimeout(() => void (glance.current.target = 0), 3100);
    return () => {
      clearTimeout(look);
      clearTimeout(back);
    };
  }, [index, stage, anchors, bootstrap.products, seat, yaw]);

  const want = useMemo(() => ({ dir: new Vector3(), aim: new Quaternion(), parent: new Quaternion(), inv: new Quaternion() }), []);
  useFrame(({ clock }, dt) => {
    if (!rig) return;
    if (rig.clips) {
      rig.mixer.update(dt);
      return;
    }
    const quick = reducedMotion ? 1 : 0;
    attention.current = quick ? attentionTarget.current : MathUtils.damp(attention.current, attentionTarget.current, 5, dt);
    glance.current.weight = quick ? glance.current.target : MathUtils.damp(glance.current.weight, glance.current.target, 4, dt);
    nod.current = MathUtils.damp(nod.current, 0, 3.2, dt);
    const t = clock.elapsedTime;
    const working = reducedMotion ? 0 : 1 - attention.current; // his hands only move while his eyes are on the work
    const feed = Math.sin(t * 2.3) * 0.035 * working;
    const sway = Math.sin(t * 1.15) * 0.012 * working;
    const dip = Math.sin(Math.min(1, 1 - nod.current) * Math.PI) * 0.22 * (nod.current > 0.02 ? 1 : 0); // one small nod

    const { joints, now } = rig;
    for (let i = 0; i < joints.length; i++) {
      const j = joints[i];
      if (!j) continue;
      const parentNow = j.parent >= 0 ? now[j.parent] : undefined;
      // What its parent's rotation is right now, in the character's own space. For the first joint that is whatever sits above it at rest.
      if (parentNow) want.parent.copy(parentNow);
      else want.parent.copy(j.restModel).multiply(want.inv.copy(j.restLocal).invert());
      const head = HEAD_DOWN[j.key];
      const up = HEAD_UP[j.key];
      const limb = SEWING_POSE[j.key];
      const out = now[i];
      if (!out) continue;
      if (j.restDir && (limb || (head && up))) {
        if (head && up) {
          const a = attention.current;
          want.dir.set(MathUtils.lerp(head[0], up[0], a), MathUtils.lerp(head[1], up[1], a), MathUtils.lerp(head[2], up[2], a) + dip);
          if (j.key === "Head") want.dir.applyAxisAngle(UP, glance.current.yaw * glance.current.weight);
          else want.dir.applyAxisAngle(UP, glance.current.yaw * glance.current.weight * 0.35);
        } else if (limb) {
          want.dir.set(limb[0], limb[1], limb[2]);
          if (j.key.endsWith("ForeArm")) want.dir.z += feed * (j.key.startsWith("Left") ? 1 : -1);
          if (j.key.startsWith("Spine")) want.dir.x += sway;
        }
        want.aim.setFromUnitVectors(j.restDir, want.dir.normalize());
        out.copy(want.aim).multiply(j.restModel);
        j.bone.quaternion.copy(want.inv.copy(want.parent).invert()).multiply(out);
      } else {
        out.copy(want.parent).multiply(j.restLocal);
        j.bone.quaternion.copy(j.restLocal);
      }
    }
  });

  if (!gltf || !rig) return null;
  return (
    <group ref={root} position={[seat.x, 0, seat.z]} rotation-y={yaw}>
      <group position-y={SEATED_HIP_HEIGHT - rig.hipHeight * rig.scale} scale={rig.scale}>
        <primitive object={gltf.scene} />
      </group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.016, 0.18]} scale={[1.2, 1.5, 1]} renderOrder={1}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial map={patch} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
