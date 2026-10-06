import type { StoreStage } from "@/experience/store-machine";

/**
 * Jesse seated at his machine (specs/10, 6 Oct 2026): the parts that are plain decisions and numbers, kept apart from the 3D code so they can be
 * tested and read on their own.
 *
 * There are two ways he can be made to sit. A finished character brings its own clips, named as below, and the site simply plays them. The
 * stand-in has none, so its joints are aimed in code: each limb is told which way to POINT (thigh forward, shin down, forearms towards the
 * needle), in the character's own space, and the joint rotations are worked out from that. Nothing here depends on how a particular
 * skeleton's joints happen to be twisted, only on their names.
 */

/** The clips a finished character must carry, by exact name, for the site to use them instead of the code-made pose. */
export const SEATED_CLIPS = ["sit_sew", "sit_look_up", "sit_idle", "sit_nod", "sit_return"] as const;
export type SeatedClip = (typeof SEATED_CLIPS)[number];

export function hasSeatedClips(names: Iterable<string>): boolean {
  const have = new Set(names);
  return SEATED_CLIPS.every((clip) => have.has(clip));
}

/** A joint's name without the prefix some skeletons put in front of it ("mixamorig:Head" and "Head" are the same joint). */
export const jointKey = (name: string): string => name.replace(/^.*[:_](?=[A-Z])/, "").replace(/^mixamorig/, "");

/** Is he looking at the visitor (1) or down at his work (0)? He looks up to greet, and otherwise gets on with it. */
export const attentionFor = (stage: StoreStage): 0 | 1 => (stage === "greeting" ? 1 : 0);

/** Which clip a finished character plays as the visitor moves from one stage to another. `null` means carry on with what is playing. */
export function seatedClipFor(stage: StoreStage, previous: StoreStage): SeatedClip | null {
  if (stage === previous) return null;
  if (stage === "greeting") return "sit_look_up"; // then sit_idle, which the player chains on
  if (previous === "greeting") return "sit_nod"; // then sit_return and sit_sew
  if (stage === "productSelected") return "sit_nod";
  return null;
}

type Dir = readonly [number, number, number];

/**
 * Where each limb points when he is sewing, in the character's own space: x to his left, y up, z the way he faces.
 * The seat is 0.50 m high and the needle plate is at 0.79 m, 0.45 m in front of his hips, so the upper arms hang forward and the forearms
 * run down a little and inwards to meet at the work.
 */
export const SEWING_POSE: Readonly<Record<string, Dir>> = {
  Spine: [0, 1, 0.16],
  Spine1: [0, 1, 0.3],
  Spine2: [0, 1, 0.4],
  LeftUpLeg: [0.16, -0.1, 1],
  RightUpLeg: [-0.16, -0.1, 1],
  LeftLeg: [0.02, -1, -0.1],
  RightLeg: [-0.02, -1, -0.1],
  LeftFoot: [0.08, -0.25, 1],
  RightFoot: [-0.08, -0.25, 1],
  LeftShoulder: [1, 0.05, 0.25],
  RightShoulder: [-1, 0.05, 0.25],
  LeftArm: [0.3, -0.78, 0.55],
  RightArm: [-0.3, -0.78, 0.55],
  LeftForeArm: [-0.4, -0.2, 0.9],
  RightForeArm: [0.4, -0.2, 0.9],
  LeftHand: [-0.3, -0.05, 1],
  RightHand: [0.3, -0.05, 1],
};

/** Neck and head: bent over the work, and lifted to the visitor. The camera sits a little above his eye line, so "lifted" is very slightly up. */
export const HEAD_DOWN: Readonly<Record<string, Dir>> = { Neck: [0, 1, 0.62], Head: [0, 1, 0.95] };
export const HEAD_UP: Readonly<Record<string, Dir>> = { Neck: [0, 1, 0.18], Head: [0, 1, 0.06] };

/** How high his hips sit above the floor on the 0.50 m stool, in metres. */
export const SEATED_HIP_HEIGHT = 0.6;
