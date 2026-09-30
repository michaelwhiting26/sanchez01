/**
 * The guided tour: from the moment someone lands, the site plays itself. The hero intro runs, then the page scrolls itself down through the sections
 * in order, waits while the gallery plays through, and ends on the waitlist with the bag. Any wheel, touch, key press or click hands control straight
 * back to the visitor (and the tour never restarts). Nothing here changes the sections themselves: it only scrolls the window.
 */
export interface TourStop {
  /** Selector of the section to fly to. */
  selector: string;
  /** Where the section's top edge lands, as a share of the viewport height (0 = top of screen). */
  at?: number;
  /** How long to rest there once arrived, ms. */
  dwellMs: number;
  /** For the pinned gallery: wait for it to play through before moving on. */
  waitFor?: string;
}

export const TOUR_STOPS: readonly TourStop[] = [
  { selector: ".curved-loop", at: 0.12, dwellMs: 1600 },
  { selector: ".lgc-track", at: -1, dwellMs: 1500, waitFor: "gallery:autoplay-done" },
  { selector: ".sz-marquee", at: 0.3, dwellMs: 1400 },
  { selector: "[data-bag-punch]", at: 0, dwellMs: 4200 },
  { selector: ".depth-cards", at: 0.08, dwellMs: 2200 },
  { selector: "#waitlist", at: -2, dwellMs: 0 }, // the end: the rise panel with the waitlist, the globe and the bag
];

const ease = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export class AutoTour {
  private stopped = false;
  private raf = 0;
  private readonly cancels: Array<() => void> = [];
  private readonly interrupt = (e: Event): void => {
    if (e instanceof KeyboardEvent && !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Escape"].includes(e.key)) return;
    this.stop();
  };

  constructor(
    private readonly onEnd: () => void,
    private readonly stops: readonly TourStop[] = TOUR_STOPS,
  ) {}

  get running(): boolean {
    return !this.stopped;
  }

  start(): void {
    for (const ev of ["wheel", "touchstart", "pointerdown", "keydown"]) window.addEventListener(ev, this.interrupt, { passive: true });
    void this.run();
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    cancelAnimationFrame(this.raf);
    for (const ev of ["wheel", "touchstart", "pointerdown", "keydown"]) window.removeEventListener(ev, this.interrupt);
    this.cancels.forEach((c) => c());
    this.onEnd();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const id = window.setTimeout(resolve, ms);
      this.cancels.push(() => window.clearTimeout(id));
    });
  }

  private waitEvent(name: string, timeoutMs: number): Promise<{ skipped: boolean }> {
    return new Promise((resolve) => {
      const done = (e?: Event): void => {
        window.removeEventListener(name, done);
        window.clearTimeout(id);
        resolve({ skipped: Boolean((e as CustomEvent<{ skipped?: boolean }> | undefined)?.detail?.skipped) });
      };
      const id = window.setTimeout(() => done(), timeoutMs);
      window.addEventListener(name, done);
      this.cancels.push(() => {
        window.removeEventListener(name, done);
        window.clearTimeout(id);
      });
    });
  }

  /** Scroll the window to y with an ease in and out, at a calm reading pace. Resolves when it lands or the tour is stopped. */
  private fly(y: number): Promise<void> {
    return new Promise((resolve) => {
      const from = window.scrollY;
      const dist = y - from;
      if (Math.abs(dist) < 2) return resolve();
      const dur = Math.min(4800, Math.max(1000, Math.abs(dist) / 0.42)); // ~420px per second
      const t0 = performance.now();
      const step = (now: number): void => {
        if (this.stopped) return resolve();
        const p = Math.min(1, (now - t0) / dur);
        window.scrollTo(0, from + dist * ease(p));
        if (p < 1) this.raf = requestAnimationFrame(step);
        else resolve();
      };
      this.raf = requestAnimationFrame(step);
    });
  }

  private targetY(stop: TourStop): number | null {
    const el = document.querySelector<HTMLElement>(stop.selector);
    if (!el) return null;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const at = stop.at ?? 0;
    if (at === -1) {
      // the pinned gallery: just inside the track, so its own autoplay takes over
      const head = parseFloat(getComputedStyle(el).getPropertyValue("--header-h")) || 0;
      return top - head + 14;
    }
    if (at === -2) return document.documentElement.scrollHeight - window.innerHeight; // the very end of the page
    return top - window.innerHeight * at;
  }

  private async run(): Promise<void> {
    for (const stop of this.stops) {
      if (this.stopped) return;
      const y = this.targetY(stop);
      if (y === null) continue;
      await this.fly(y);
      if (this.stopped) return;
      if (stop.waitFor) {
        const r = await this.waitEvent(stop.waitFor, 90000);
        if (r.skipped || this.stopped) return this.stop(); // the visitor pushed through the gallery: the tour is theirs now
        await this.sleep(1600); // the gallery eases itself down to its last slide
      }
      if (stop.dwellMs) await this.sleep(stop.dwellMs);
    }
    this.stop();
  }
}
