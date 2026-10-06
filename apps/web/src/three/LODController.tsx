"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { GPU_BENCHMARKS_URL, startingQuality } from "./gpu-grade";
import { useScene } from "./scene-store";

/** Keeps the frame rate up (spec: performance). If the phone cannot hold the target, draw fewer pixels and drop the dust before anything stutters. */
export function LODController() {
  const setDpr = useThree((s) => s.setDpr);
  const dpr = useScene((s) => s.dpr);
  const setQuality = useScene((s) => s.setQuality);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio, dpr));
  }, [dpr, setDpr]);
  // Development only: `?quality=full` holds the full quality level whatever the frame rate, so the live product shadow can be checked on a
  // slow test browser. The check never runs in a production build.
  const held = process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).get("quality") === "full";
  // A phone whose chip is known to be slow starts on the reduced level, so it does not stutter through the walk-in while the frame timing
  // below catches up. The library loads on its own, after the scene, and a failed look-up leaves the level where it was.
  useEffect(() => {
    if (held) return;
    let cancelled = false;
    import("detect-gpu")
      .then(({ getGPUTier }) => getGPUTier({ benchmarksURL: GPU_BENCHMARKS_URL, glContext: gl.getContext() }))
      .then((result) => {
        if (!cancelled && startingQuality(result) === 1) setQuality(1, 1);
      })
      .catch((error: unknown) => console.warn("Store: the graphics chip could not be graded; staying on the full quality level.", error));
    return () => {
      cancelled = true;
    };
  }, [gl, held, setQuality]);
  if (held) return null;
  return <PerformanceMonitor bounds={() => [40, 58]} flipflops={3} onDecline={() => setQuality(1, 1)} onIncline={() => setQuality(0, 1.5)} onFallback={() => setQuality(1, 1)} />;
}
