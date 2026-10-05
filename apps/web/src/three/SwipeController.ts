/** Swipe between products (spec Part 4). Pointer Events only, so it works with touch, pen and mouse. */
export const SWIPE_DISTANCE = 42; // px
export const SWIPE_VELOCITY = 0.32; // px per ms

export type SwipeResult = "next" | "previous" | "none";

/**
 * `distance` and `velocity` are positive when the finger travels left (the shop slides left, so the next product arrives).
 * A mostly-vertical drag is a page scroll, not a swipe.
 */
export function resolveSwipe(distance: number, velocity: number, verticalDistance = 0): SwipeResult {
  if (Math.abs(verticalDistance) > Math.abs(distance)) return "none";
  if (distance > SWIPE_DISTANCE || velocity > SWIPE_VELOCITY) return "next";
  if (distance < -SWIPE_DISTANCE || velocity < -SWIPE_VELOCITY) return "previous";
  return "none";
}

export interface SwipeHandlers {
  onNext(): void;
  onPrevious(): void;
  /** A press that never became a swipe (used to let taps reach the 3D products). */
  onTap?(clientX: number, clientY: number): void;
  enabled(): boolean;
}

export class SwipeController {
  private startX = 0;
  private startY = 0;
  private startT = 0;
  private lastX = 0;
  private lastT = 0;
  private pointerId: number | null = null;
  private readonly off: Array<() => void> = [];

  constructor(
    private readonly el: HTMLElement,
    private readonly handlers: SwipeHandlers,
  ) {
    const on = <K extends keyof HTMLElementEventMap>(type: K, fn: (e: HTMLElementEventMap[K]) => void): void => {
      el.addEventListener(type, fn, { passive: true });
      this.off.push(() => el.removeEventListener(type, fn));
    };
    on("pointerdown", this.down);
    on("pointermove", this.move);
    on("pointerup", this.up);
    on("pointercancel", this.cancel);
  }

  private readonly down = (e: PointerEvent): void => {
    if (!this.handlers.enabled() || this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    this.startX = this.lastX = e.clientX;
    this.startY = e.clientY;
    this.startT = this.lastT = e.timeStamp;
  };

  private readonly move = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.lastX = e.clientX;
    this.lastT = e.timeStamp;
  };

  private readonly up = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = null;
    const distance = this.startX - e.clientX;
    const elapsed = Math.max(e.timeStamp - this.startT, 1);
    const result = resolveSwipe(distance, distance / elapsed, e.clientY - this.startY);
    if (result === "next") this.handlers.onNext();
    else if (result === "previous") this.handlers.onPrevious();
    else if (Math.abs(distance) < 8 && Math.abs(e.clientY - this.startY) < 8) this.handlers.onTap?.(e.clientX, e.clientY);
  };

  private readonly cancel = (e: PointerEvent): void => {
    if (e.pointerId === this.pointerId) this.pointerId = null;
  };

  dispose(): void {
    for (const fn of this.off) fn();
    this.off.length = 0;
  }
}
