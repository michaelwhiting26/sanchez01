import gsap from "gsap";
import { CatmullRomCurve3, Vector3, type Curve, type PerspectiveCamera } from "three";

/**
 * Moves the camera the way a person would move (spec Part 2 and Part 4): along a curve, with the eyes following their own curve, never free-roaming.
 * One tween at a time; a new move takes over from wherever the last one had reached.
 */
export class CinematicCameraController {
  progress = 0;
  private tween: gsap.core.Tween | null = null;
  /** Where the camera is looking; kept so the next move can start from it. */
  readonly look = new Vector3();
  private readonly tmp = new Vector3();

  constructor(private readonly camera: PerspectiveCamera) {}

  place(position: Vector3, look: Vector3): void {
    this.kill();
    this.camera.position.copy(position);
    this.look.copy(look);
    this.camera.lookAt(look);
  }

  /** Walks a path. `stride` adds a barely-there step rhythm: if a visitor notices it, it is too strong. */
  play(path: Curve<Vector3>, lookPath: Curve<Vector3>, duration: number, opts: { ease?: string; stride?: number; onComplete?: () => void } = {}): void {
    this.kill();
    this.progress = 0;
    const stride = opts.stride ?? 0;
    this.tween = gsap.to(this, {
      progress: 1,
      duration,
      ease: opts.ease ?? "power2.inOut",
      onUpdate: () => {
        path.getPoint(this.progress, this.camera.position);
        if (stride) this.camera.position.y += Math.sin(this.progress * Math.PI * 8) * stride * Math.sin(this.progress * Math.PI);
        lookPath.getPoint(this.progress, this.look);
        this.camera.lookAt(this.look);
      },
      onComplete: () => {
        this.tween = null;
        opts.onComplete?.();
      },
    });
  }

  /** A straight, eased move from the current position to a new standing point (the sideways step between products). */
  moveTo(position: Vector3, look: Vector3, duration: number, ease = "power3.inOut", onComplete?: () => void): void {
    const from = this.camera.position.clone();
    const fromLook = this.look.clone();
    if (duration <= 0) {
      this.place(position, look);
      onComplete?.();
      return;
    }
    // A shallow arc towards the room keeps a sideways step from feeling like a slide on rails.
    const mid = from.clone().lerp(position, 0.5);
    mid.z += Math.min(from.distanceTo(position) * 0.06, 0.25);
    this.play(new CatmullRomCurve3([from, mid, position.clone()]), new CatmullRomCurve3([fromLook, fromLook.clone().lerp(look, 0.5), look.clone()]), duration, onComplete ? { ease, onComplete } : { ease });
  }

  /** Tiny idle sway while standing still, in metres. Call every frame with the standing point. */
  breathe(base: Vector3, time: number, amount: number): void {
    if (this.tween) return;
    this.tmp.set(Math.sin(time * 0.6) * amount, Math.sin(time * 0.9) * amount * 0.6, 0);
    this.camera.position.copy(base).add(this.tmp);
    this.camera.lookAt(this.look);
  }

  get moving(): boolean {
    return this.tween !== null;
  }

  kill(): void {
    this.tween?.kill();
    this.tween = null;
  }
}

export const curveFrom = (points: ReadonlyArray<readonly [number, number, number]>): CatmullRomCurve3 => new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));
