/**
 * The hand-off between the hero's canvas runner and the ribbon figure: one man, never two.
 *
 * A tiny module-level registry (no window globals). The hero engine publishes WHERE the runner hides, once he is really hiding (the return pass has finished);
 * the ribbon reads it, and tells the hero to stop drawing the canvas runner the moment the ribbon figure exists. Both directions are plain function calls.
 */

export interface HeroHideSpot {
  /** Middle of his feet, viewport CSS px (y is kept current with the page's scroll). */
  x: number;
  y: number;
  /** Sprite frame height in CSS px, and CSS px per sprite px. */
  size: number;
  scale: number;
  facing: "left" | "right";
}

let published: (HeroHideSpot & { scrollY: number }) | null = null;
let runnerHidden = false;
const listeners = new Set<(hidden: boolean) => void>();

const scrollNow = (): number => (typeof window === "undefined" ? 0 : window.scrollY);

/** Engine: the hiding place (viewport CSS px, measured when the page was at `scrollY`), or null while he is not hiding yet. */
export function setHeroHideSpot(spot: HeroHideSpot | null, scrollY: number = scrollNow()): void {
  published = spot ? { ...spot, scrollY } : null;
}

/** Ribbon: where he hides, in viewport CSS px for the current scroll; null until he is hiding. */
export function getHeroHideSpot(): HeroHideSpot | null {
  if (!published) return null;
  const { scrollY, ...spot } = published;
  return { ...spot, y: spot.y - (scrollNow() - scrollY) };
}

/** Ribbon: hide (true) or show (false) the hero's canvas runner. Listeners run synchronously so the hero can repaint in the same frame. */
export function setHeroRunnerHidden(hidden: boolean): void {
  if (hidden === runnerHidden) return;
  runnerHidden = hidden;
  for (const cb of listeners) cb(hidden);
}

export const isHeroRunnerHidden = (): boolean => runnerHidden;

export function onHeroRunnerHidden(cb: (hidden: boolean) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// ---------------------------------------------------------------- who owns Jesse

/** Which single figure is drawn now: the hero's canvas runner, the ribbon figure, the gallery figure, or nobody (he is between scenes, off screen). */
export type JesseOwner = "hero" | "ribbon" | "gallery" | "transit" | "none";
/** What one scene says about itself: `idle` = not reached yet (scrolled above it), `active` = its figure is on screen, `spent` = he has left it (scrolled past). */
export type JesseStatus = "idle" | "active" | "spent";

export type JesseScene = "ribbon" | "gallery" | "transit";
const status: Record<JesseScene, JesseStatus> = { ribbon: "idle", gallery: "idle", transit: "idle" };
let owner: JesseOwner = "hero";
const ownerListeners = new Set<(o: JesseOwner) => void>();

function deriveOwner(): JesseOwner {
  if (status.transit === "active") return "transit";
  if (status.gallery === "active") return "gallery";
  if (status.ribbon === "active") return "ribbon";
  if (status.transit === "spent" || status.gallery === "spent" || status.ribbon === "spent") return "none";
  return "hero";
}

/**
 * A scene reports its status; returns the resulting owner. The hero's canvas runner is hidden exactly while the owner is not "hero".
 * Priority gallery > ribbon, so even a transient overlap never draws two: a scene draws only while `owner === itself`.
 */
export function setJesseStatus(who: JesseScene, s: JesseStatus): JesseOwner {
  status[who] = s;
  const next = deriveOwner();
  if (next !== owner) {
    owner = next;
    setHeroRunnerHidden(owner !== "hero");
    for (const cb of ownerListeners) cb(owner);
  }
  return owner;
}

export const getJesseOwner = (): JesseOwner => owner;

/** Called synchronously when the owner changes (so the loser hides in the same frame). Pass an AbortSignal to unsubscribe. */
export function onJesseOwner(cb: (o: JesseOwner) => void, signal?: AbortSignal): void {
  ownerListeners.add(cb);
  signal?.addEventListener("abort", () => ownerListeners.delete(cb));
}

/** Tests only. */
export function resetHandoff(): void {
  published = null;
  runnerHidden = false;
  listeners.clear();
  status.ribbon = "idle";
  status.gallery = "idle";
  status.transit = "idle";
  owner = "hero";
  ownerListeners.clear();
}

/** One man, one size: the ribbon figure (the size Michael signed off) publishes its sprite frame size and every other scene draws Jesse at it. 0 until measured. */
let jesseSize = 0;
export const setJesseSize = (px: number): void => {
  jesseSize = px;
};
export const getJesseSize = (): number => jesseSize;
