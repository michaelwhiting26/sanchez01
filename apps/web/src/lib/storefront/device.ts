/** Can this device run the 3D store? If not, the visitor gets the same journey as plain pages (spec: low-end fallback). */
export function supportsWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return canvas.getContext("webgl2") !== null;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function wantsLightExperience(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  return nav.connection?.saveData === true || (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2);
}
