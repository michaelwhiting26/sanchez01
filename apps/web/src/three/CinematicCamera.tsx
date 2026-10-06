"use client";

import gsap from "gsap";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, MathUtils, Vector3, type PerspectiveCamera } from "three";
import { ENTRANCE_LOOK_PATH, ENTRANCE_PATH, TIMING } from "@/lib/storefront/config";
import { readTilt } from "@/lib/storefront/tilt";
import type { StoreStage } from "@/experience/store-machine";
import { CinematicCameraController, curveFrom } from "./CinematicCameraController";
import { useScene } from "./scene-store";
import type { WorldProps } from "./types";

const v = (p: readonly [number, number, number]): Vector3 => new Vector3(p[0], p[1], p[2]);
const ARRIVAL = v(ENTRANCE_PATH[0] ?? [0.45, 1.62, 7.65]);
const ARRIVAL_LOOK = v(ENTRANCE_LOOK_PATH[0] ?? [0, 1.95, 0]);
/** How far a full tilt of the phone moves the arrival view, in metres at the shop front (about 5 degrees across, 3 up and down) and at the camera. */
const TILT = { lookX: 0.65, lookY: 0.38, stepX: 0.22 } as const;

/** Drives the one camera from the store's stage. No orbit, pan or pinch: the visitor cannot get lost (spec §0). */
export function CinematicCamera({ bootstrap, stage, index, reducedMotion, send }: Omit<WorldProps, "onOpenStory">) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const aspect = useThree((s) => s.viewport.aspect);
  const anchors = useScene((s) => s.anchors);
  const ready = useScene((s) => s.workshopReady);
  const controller = useMemo(() => new CinematicCameraController(camera), [camera]);
  const previous = useRef<StoreStage>("boot");
  const base = useRef(ARRIVAL.clone());
  const tilt = useRef({ x: 0, y: 0 });
  const tiltedLook = useRef(ARRIVAL_LOOK.clone());
  const standing = useRef(ARRIVAL.clone());

  // Two lenses. Outside, a longer one from across the street: the shop front reads as a photograph, not a wide game view.
  // Inside, a slightly wider one, so the room has air round Jesse and round each product and a turn of the head does not sweep the whole view.
  const arrivalFov = aspect < 0.7 ? 50 : aspect < 1 ? 46 : 40;
  const insideFov = aspect < 0.7 ? 54 : aspect < 1 ? 50 : 44;
  useEffect(() => {
    const to = stage === "boot" || stage === "arrive" ? arrivalFov : insideFov;
    const apply = (): void => camera.updateProjectionMatrix();
    if (stage === "entering" && !reducedMotion) {
      const tween = gsap.to(camera, { fov: to, duration: TIMING.enter, ease: "sine.inOut", onUpdate: apply });
      return () => {
        tween.kill();
      };
    }
    camera.fov = to;
    apply();
    return undefined;
  }, [camera, stage, arrivalFov, insideFov, reducedMotion]);

  useEffect(() => {
    const was = previous.current;
    previous.current = stage;
    const product = bootstrap.products[index];
    const mark = (name: string): Vector3 | undefined => anchors.get(name);

    if (stage === "boot" || stage === "arrive") {
      controller.place(ARRIVAL, ARRIVAL_LOOK);
      base.current.copy(ARRIVAL);
      return;
    }
    if (stage === "entering") {
      const end = mark("CAM_GREETING") ?? v(ENTRANCE_PATH.at(-1) ?? [-0.2, 1.66, -1.8]);
      const endLook = mark("LOOK_GREETING") ?? v(ENTRANCE_LOOK_PATH.at(-1) ?? [1.3, 1.5, -3.3]);
      if (reducedMotion) {
        controller.place(end, endLook);
        base.current.copy(end);
        send({ type: "CAMERA_COMPLETE" });
        return;
      }
      // Start from wherever the visitor is actually looking (they may have tilted the phone), so the walk begins without a jump.
      const path = new CatmullRomCurve3([camera.position.clone(), ...ENTRANCE_PATH.slice(1, -1).map(v), end]);
      const look = new CatmullRomCurve3([tiltedLook.current.clone(), ...ENTRANCE_LOOK_PATH.slice(1, -1).map(v), endLook]);
      controller.play(path, look, TIMING.enter, {
        ease: "sine.inOut", // the gentlest start and stop: no surge in the middle of the walk
        stride: 0.003,
        onComplete: () => {
          base.current.copy(end);
          send({ type: "CAMERA_COMPLETE" });
        },
      });
      return;
    }
    // Looking at the wall: step back to where the whole collection display fits the screen, over Jesse's head.
    if (stage === "lookingAround") {
      const to = mark("CAM_WALL") ?? mark("CAM_GREETING");
      const look = mark("LOOK_WALL") ?? mark("LOOK_GREETING");
      if (to && look) controller.moveTo(to, look, reducedMotion ? 0 : was === "greeting" ? 1.8 : TIMING.firstProduct, "sine.inOut", () => base.current.copy(to));
      return;
    }
    if (!ready || !product) return;
    if (stage === "browsing" || stage === "productSelected" || stage === "builderLoading") {
      const focus = stage !== "browsing";
      const to = mark(`${focus ? "CAM_FOCUS" : "CAM_PRODUCT"}_${product.cameraAnchor}`);
      const look = mark(`LOOK_PRODUCT_${product.cameraAnchor}`);
      if (!to || !look) return;
      const seconds = reducedMotion ? 0 : focus || was === "productSelected" ? TIMING.focus : was === "greeting" || was === "lookingAround" ? TIMING.firstProduct : TIMING.swipe;
      controller.moveTo(to, look, seconds, was === "greeting" || was === "lookingAround" ? "sine.inOut" : "power2.inOut", () => base.current.copy(to));
    }
  }, [stage, index, ready, anchors, bootstrap.products, controller, reducedMotion, send]);

  useEffect(() => () => controller.kill(), [controller]);

  // Standing still, the view breathes very slightly so the room never looks like a photograph.
  // On the street the visitor can also look around a little by tilting the phone (or moving the mouse): the aim shifts a few degrees and the
  // standing point a hand's width, which is enough for the door, lanterns and windows to slide against each other.
  useFrame(({ clock }, dt) => {
    if (reducedMotion || controller.moving) return;
    if (stage !== "arrive") {
      controller.breathe(base.current, clock.elapsedTime, 0.006);
      return;
    }
    const want = readTilt();
    tilt.current.x = MathUtils.damp(tilt.current.x, want.x, 5, dt);
    tilt.current.y = MathUtils.damp(tilt.current.y, want.y, 5, dt);
    standing.current.copy(base.current);
    standing.current.x += tilt.current.x * TILT.stepX;
    tiltedLook.current.set(ARRIVAL_LOOK.x + tilt.current.x * TILT.lookX, ARRIVAL_LOOK.y - tilt.current.y * TILT.lookY, ARRIVAL_LOOK.z);
    controller.breathe(standing.current, clock.elapsedTime, 0.012, tiltedLook.current);
  });

  return null;
}

export { curveFrom };
