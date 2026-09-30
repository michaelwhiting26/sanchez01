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

/** Tests only. */
export function resetHandoff(): void {
  published = null;
  runnerHidden = false;
  listeners.clear();
}
