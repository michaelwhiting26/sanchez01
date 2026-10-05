"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Vector3, type PerspectiveCamera } from "three";
import { ENTRANCE_LOOK_PATH, ENTRANCE_PATH, TIMING } from "@/lib/storefront/config";
import type { StoreStage } from "@/experience/store-machine";
import { CinematicCameraController, curveFrom } from "./CinematicCameraController";
import { useScene } from "./scene-store";
import type { WorldProps } from "./types";

const v = (p: readonly [number, number, number]): Vector3 => new Vector3(p[0], p[1], p[2]);
const ARRIVAL = v(ENTRANCE_PATH[0] ?? [0.15, 1.68, 4.2]);
const ARRIVAL_LOOK = v(ENTRANCE_LOOK_PATH[0] ?? [0, 1.55, 0]);

/** Drives the one camera from the store's stage. No orbit, pan or pinch: the visitor cannot get lost (spec §0). */
export function CinematicCamera({ bootstrap, stage, index, reducedMotion, send }: WorldProps) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const aspect = useThree((s) => s.viewport.aspect);
  const anchors = useScene((s) => s.anchors);
  const ready = useScene((s) => s.workshopReady);
  const controller = useMemo(() => new CinematicCameraController(camera), [camera]);
  const previous = useRef<StoreStage>("boot");
  const base = useRef(ARRIVAL.clone());

  // A phone held upright sees a narrow slice of the room: widen the lens so a product and its surroundings still fit.
  useEffect(() => {
    camera.fov = aspect < 0.7 ? 62 : aspect < 1 ? 56 : 46;
    camera.updateProjectionMatrix();
  }, [camera, aspect]);

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
