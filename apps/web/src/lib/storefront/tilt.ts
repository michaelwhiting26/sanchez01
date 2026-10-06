/**
 * The visitor's phone tilt, as a gentle look-around on the arrival shot (owner, 6 Oct 2026). On a desktop the mouse does the same job.
 * Values run from -1 to 1 on each axis; the camera decides how far that moves the view (a few degrees, never a free look).
 *
 * The neutral position is however the phone is being held when readings start, and it drifts slowly towards the current angle,
 * so the view always settles back to the door rather than staying off to one side.
 *
 * iPhones only give a page the motion sensor after the visitor taps something and accepts Apple's prompt: see `tiltNeedsPermission`.
 */
export interface Tilt {
  x: number;
  y: number;
}

/** Degrees of tilt that give the full effect. */
const RANGE = 16;
/** How quickly the neutral position follows the phone (per second). */
const RECENTRE = 0.35;

const target: Tilt = { x: 0, y: 0 };
let neutral: { beta: number; gamma: number } | null = null;
let lastReading = 0;

const clamp = (v: number): number => Math.min(1, Math.max(-1, v));

function onOrientation(e: DeviceOrientationEvent): void {
  if (e.beta === null || e.gamma === null) return;
  const now = performance.now();
  const dt = lastReading ? Math.min((now - lastReading) / 1000, 0.25) : 0;
  lastReading = now;
  if (!neutral) neutral = { beta: e.beta, gamma: e.gamma };
  const k = 1 - Math.exp(-dt * RECENTRE);
  neutral.beta += (e.beta - neutral.beta) * k;
  target.y = clamp((e.beta - neutral.beta) / RANGE);
  // Held almost bolt upright, the sideways reading becomes unreliable: keep the last good value.
  if (Math.abs(e.beta) < 78) {
    neutral.gamma += (e.gamma - neutral.gamma) * k;
    target.x = clamp((e.gamma - neutral.gamma) / RANGE);
  }
}

function onPointer(e: PointerEvent): void {
  if (e.pointerType !== "mouse") return;
  target.x = clamp((e.clientX / window.innerWidth) * 2 - 1);
  target.y = clamp((e.clientY / window.innerHeight) * 2 - 1);
}

/** The latest tilt. Read every frame; smooth it before using it. */
export function readTilt(): Readonly<Tilt> {
  return target;
}

type OrientationWithPermission = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

const orientation = (): OrientationWithPermission | null => (typeof DeviceOrientationEvent === "undefined" ? null : DeviceOrientationEvent);

/** True on iPhones and iPads, where the motion sensor has to be asked for from a tap. */
export function tiltNeedsPermission(): boolean {
  // Some desktop browsers carry the same permission call; only a hand-held device has a tilt worth asking for.
  return typeof orientation()?.requestPermission === "function" && window.matchMedia("(pointer: coarse)").matches;
}

/** Shows Apple's motion prompt. Must be called from a tap. Resolves true if the visitor allows it. */
export async function requestTiltPermission(): Promise<boolean> {
  const ask = orientation()?.requestPermission;
  if (!ask) return true;
  try {
    return (await ask.call(orientation())) === "granted";
  } catch {
    return false;
  }
}

/** Starts listening. Safe to call before permission is given: readings simply begin once it is. Returns the function that stops it. */
export function startTilt(): () => void {
  window.addEventListener("deviceorientation", onOrientation);
  window.addEventListener("pointermove", onPointer);
  return () => {
    window.removeEventListener("deviceorientation", onOrientation);
    window.removeEventListener("pointermove", onPointer);
    neutral = null;
    lastReading = 0;
    target.x = target.y = 0;
  };
}
