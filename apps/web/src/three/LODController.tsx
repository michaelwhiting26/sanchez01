"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useScene } from "./scene-store";

/** Keeps the frame rate up (spec: performance). If the phone cannot hold the target, draw fewer pixels and drop the dust before anything stutters. */
export function LODController() {
  const setDpr = useThree((s) => s.setDpr);
  const dpr = useScene((s) => s.dpr);
  const setQuality = useScene((s) => s.setQuality);
  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio, dpr));
  }, [dpr, setDpr]);
  // Development only: `?quality=full` holds the full quality level whatever the frame rate, so the live product shadow can be checked on a
  // slow test browser. The check never runs in a production build.
  if (process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).get("quality") === "full") return null;
  return <PerformanceMonitor bounds={() => [40, 58]} flipflops={3} onDecline={() => setQuality(1, 1)} onIncline={() => setQuality(0, 1.5)} onFallback={() => setQuality(1, 1)} />;
}
