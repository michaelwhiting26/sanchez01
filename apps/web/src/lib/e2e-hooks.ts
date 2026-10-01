/**
 * Test-only hooks: `window.__sz`, used by the Playwright regression suite (apps/web/e2e) to drive the scroll-scrubbed home page deterministically.
 *
 * Enabled ONLY when `NEXT_PUBLIC_E2E === "1"` (the e2e server build) or outside production (`next dev`). Both are compile-time constants, so in a normal
 * production build `registerSz` is a no-op, `window.__sz` never exists and the bundler drops the call sites' payloads.
 *
 * What it offers (each scene registers its own public method; nothing here changes what a scene does):
 *  - `hero.seek(ms)`, `hero.duration()`, `hero.timeline()`: render the hero at an exact time of its intro (the engine's own dev seek API).
 *  - `spiral.drawAt()`: draw the DNA spiral synchronously at the current scroll (it is otherwise rAF-driven).
 *  - `ribbon.update()`, `gallery.update()`: run the ribbon figure's / the gallery's per-frame update at the current scroll now.
 *  - `owner()`: which single Jesse figure is drawn (lib/hero/handoff.ts): "hero" | "ribbon" | "gallery" | "none".
 * Freezing time is NOT done here: the suite uses Playwright's fake clock (`page.clock`), which controls rAF, timers, Date and performance.now together.
 */
import { getJesseOwner, type JesseOwner } from "@/lib/hero/handoff";

export const E2E_ENABLED: boolean = process.env.NEXT_PUBLIC_E2E === "1" || process.env.NODE_ENV !== "production";

export interface SzHooks {
  hero?: { seek(ms: number): void; duration(): number; timeline(): unknown };
  spiral?: { drawAt(): void };
  ribbon?: { update(): void };
  gallery?: { update(): void };
  owner(): JesseOwner;
}

type SzWindow = Window & { __sz?: SzHooks };

/** A scene publishes its public method(s) under `window.__sz`. Returns an unregister function (React Strict Mode mounts twice). */
export function registerSz<K extends "hero" | "spiral" | "ribbon" | "gallery">(key: K, impl: NonNullable<SzHooks[K]>): () => void {
  if (!E2E_ENABLED || typeof window === "undefined") return () => undefined;
  const w = window as SzWindow;
  const sz = (w.__sz ??= { owner: getJesseOwner });
  sz[key] = impl;
  return () => {
    if (sz[key] === impl) delete sz[key];
  };
}
