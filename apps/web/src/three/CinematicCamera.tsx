"use client";

import gsap from "gsap";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Vector3, type PerspectiveCamera } from "three";
import { ENTRANCE_LOOK_PATH, ENTRANCE_PATH, TIMING } from "@/lib/storefront/config";
import type { StoreStage } from "@/experience/store-machine";
import { CinematicCameraController, curveFrom } from "./CinematicCameraController";
import { useScene } from "./scene-store";
import type { WorldProps } from "./types";

const v = (p: readonly [number, number, number]): Vector3 => new Vector3(p[0], p[1], p[2]);
const ARRIVAL = v(ENTRANCE_PATH[0] ?? [0.45, 1.62, 7.65]);
const ARRIVAL_LOOK = v(ENTRANCE_LOOK_PATH[0] ?? [0, 1.95, 0]);

/** Drives the one camera from the store's stage. No orbit, pan or pinch: the visitor cannot get lost (spec §0). */
export function CinematicCamera({ bootstrap, stage, index, reducedMotion, send }: WorldProps) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const aspect = useThree((s) => s.viewport.aspect);
  const anchors = useScene((s) => s.anchors);
  const ready = useScene((s) => s.workshopReady);
  const controller = useMemo(() => new CinematicCameraController(camera), [camera]);
  const previous = useRef<StoreStage>("boot");
  const base = useRef(ARRIVAL.clone());

  // Two lenses. Outside, a longer one from across the street: the shop front reads as a photograph, not a wide game view.
  // Inside, nearly the same lens: every standing point in the room is composed for it (tools/store/build_store.py), so nothing has a wide-angle game look.
  const arrivalFov = aspect < 0.7 ? 50 : aspect < 1 ? 46 : 40;
  const insideFov = aspect < 0.7 ? 48 : aspect < 1 ? 46 : 40;
  useEffect(() => {
    const to = stage === "boot" || stage === "arrive" ? arrivalFov : insideFov;
    const apply = (): void => camera.updateProjectionMatrix();
    if (stage === "entering" && !reducedMotion) {
      const tween = gsap.to(camera, { fov: to, duration: TIMING.enter, ease: "power2.inOut", onUpdate: apply });
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
      const path = new CatmullRomCurve3([...ENTRANCE_PATH.slice(0, -1).map(v), end]);
      const look = new CatmullRomCurve3([...ENTRANCE_LOOK_PATH.slice(0, -1).map(v), endLook]);
      controller.play(path, look, TIMING.enter, {
        stride: 0.006,
        onComplete: () => {
          base.current.copy(end);
          send({ type: "CAMERA_COMPLETE" });
        },
      });
      return;
    }
    if (!ready || !product) return;
    if (stage === "browsing" || stage === "productSelected" || stage === "builderLoading") {
      const focus = stage !== "browsing";
      const to = mark(`${focus ? "CAM_FOCUS" : "CAM_PRODUCT"}_${product.cameraAnchor}`);
      const look = mark(`LOOK_PRODUCT_${product.cameraAnchor}`);
      if (!to || !look) return;
      const seconds = reducedMotion ? 0 : focus || was === "productSelected" ? TIMING.focus : was === "greeting" ? TIMING.firstProduct : TIMING.swipe;
      controller.moveTo(to, look, seconds, was === "greeting" ? "power2.inOut" : "power3.inOut", () => base.current.copy(to));
    }
  }, [stage, index, ready, anchors, bootstrap.products, controller, reducedMotion, send]);

  useEffect(() => () => controller.kill(), [controller]);

  // Standing still, the view breathes very slightly so the room never looks like a photograph.
  useFrame(({ clock }) => {
    if (reducedMotion || controller.moving) return;
    controller.breathe(base.current, clock.elapsedTime, stage === "arrive" ? 0.012 : 0.006);
  });

  return null;
}

export { curveFrom };
