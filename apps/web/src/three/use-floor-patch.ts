import { useEffect, useMemo } from "react";
import { CanvasTexture } from "three";

/**
 * A soft dark patch for the floor under Jesse (specs/09). He moves, or at least is not part of the room file, so the room's baked shadows cannot
 * include his; this stands in for it. A patch, not a figure-shaped shadow.
 */
export function useFloorPatch(): CanvasTexture {
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
  return patch;
}
