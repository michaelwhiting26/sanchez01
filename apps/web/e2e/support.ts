import { expect, type Page } from "@playwright/test";
import type { SzHooks } from "../src/lib/e2e-hooks";

declare global {
  interface Window {
    __sz?: SzHooks;
  }
}

/** Document-space geometry of the sections, read live from the page (never hard-coded), so a layout change moves the checkpoints with it. */
export interface Layout {
  vw: number;
  vh: number;
  scrollHeight: number;
  loop: { top: number; height: number };
  track: { top: number; height: number; travel: number };
  transit: { top: number; height: number };
  marquee: { top: number; height: number };
  handoff: { top: number; height: number };
  bag: { top: number; height: number };
  options: { top: number; height: number };
  jesse2d: { top: number; height: number };
  rise: { top: number; height: number };
}

export type JesseOwner = "hero" | "ribbon" | "gallery" | "none";

const T0 = new Date("2026-01-01T00:00:00Z");

/**
 * Load the home page under Playwright's fake clock (rAF, timers, Date and performance.now together), paused from before the first byte: network, decode and
 * hydration run in real time, but page time moves ONLY when the test says so. Every frame-driven quantity (bag spin and sway, idle punches, marquee, Submit bob,
 * film drift) is therefore a pure function of the test's own sequence of calls, not of how fast this machine loaded the assets. Math.random is seeded.
 * Returns once fonts are loaded, the hero's intro plan exists and the bag model is in.
 */
export async function boot(page: Page): Promise<void> {
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(new Date(T0.getTime() + 1000));
  await page.addInitScript(() => {
    let a = 0x5a4c3e21;
    Math.random = (): number => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  });
  await page.goto("/", { waitUntil: "load" });
  await page.waitForLoadState("networkidle"); // the runner sheets, the flag raster and the models load after `load`; a slow first request must not change what the tests see
  await expect
    .poll(
      async () => {
        const ready = await page.evaluate(() => (window.__sz?.hero?.duration() ?? 0) > 0 && document.fonts.status === "loaded" && document.querySelector(".bag-punch.is-ready") !== null);
        if (!ready) await page.clock.runFor(16); // page time advances one frame per poll, so timers and rAF chains that the loading itself depends on can run
        return ready;
      },
      { timeout: 60_000, intervals: [50] },
    )
    .toBe(true);
  // The bag turns a little every frame while nobody touches it (an idle spin that counts frames, not time, so no clock can pin it). A pointer held down on the
  // bag suspends exactly that, as it does for a visitor mid-drag, so its turn is the entry spin only: a function of scroll. Nothing else about the bag changes.
  await page.evaluate(() => {
    const canvas = document.querySelector(".bag-punch__view canvas");
    canvas?.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, pointerType: "mouse", clientX: 0, clientY: 0, bubbles: true }));
  });
  await settle(page);
}

/** Run every scene's update at the current scroll and advance the fake clock `ms` of page time in 16 ms frames (no sleeps). */
export async function settle(page: Page, opts: { heroMs?: number | "end"; ms?: number } = {}): Promise<void> {
  const update = (): Promise<void> =>
    page.evaluate((ms) => {
      const sz = window.__sz;
      if (!sz) throw new Error("window.__sz missing: the server was not built with NEXT_PUBLIC_E2E=1");
      if (ms !== undefined) sz.hero?.seek(ms === "end" ? sz.hero.duration() : ms);
      sz.spiral?.drawAt();
      sz.ribbon?.update();
      sz.gallery?.update();
    }, opts.heroMs);
  await update();
  const total = opts.ms ?? 400;
  for (let t = 0; t < total; t += 200) {
    await page.clock.runFor(Math.min(200, total - t));
    await update();
  }
}

/** Scroll instantly (the site sets smooth scrolling on html) and settle. */
export async function scrollToY(page: Page, y: number, opts: { heroMs?: number | "end"; ms?: number } = {}): Promise<void> {
  await page.evaluate((top) => window.scrollTo({ top, left: 0, behavior: "instant" }), y);
  await settle(page, opts);
  await waitForViewportImages(page);
}

/** Every <img> that intersects the viewport (lazy ones included) is decoded before a screenshot. */
export async function waitForViewportImages(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          [...document.images].every((img) => {
            const r = img.getBoundingClientRect();
            const near = r.bottom > -50 && r.top < window.innerHeight + 50 && r.right > 0 && r.left < window.innerWidth;
            return !near || (img.complete && img.naturalWidth > 0);
          }),
        ),
      { timeout: 20_000 },
    )
    .toBe(true);
}

export async function readLayout(page: Page): Promise<Layout> {
  return page.evaluate(() => {
    const box = (sel: string): { top: number; height: number } => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`missing ${sel}`);
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, height: r.height };
    };
    const track = document.querySelector<HTMLElement>(".lgc-track");
    if (!track) throw new Error("missing .lgc-track");
    return {
      vw: window.innerWidth,
      vh: window.innerHeight,
      scrollHeight: document.scrollingElement?.scrollHeight ?? 0,
      loop: box(".curved-loop"),
      track: { ...box(".lgc-track"), travel: parseFloat(track.style.getPropertyValue("--pg-travel")) || 0 },
      transit: box(".sz-transit"),
      marquee: box(".sz-marquee"),
      handoff: box(".sz-handoff"),
      bag: box(".bag-punch"),
      options: box(".sz-options"),
      jesse2d: box(".jesse-2d"),
      rise: box(".rise"),
    };
  });
}

/** Scroll target that puts the middle of a section in the middle of the viewport. */
export const centred = (b: { top: number; height: number }, vh: number): number => Math.max(0, Math.round(b.top + b.height / 2 - vh / 2));

/** The gallery's pin progress d (0 at the start of the pin, 1 when the strip has stopped) as a scroll position. */
export const galleryY = (l: Layout, d: number): number => Math.round(l.track.top + l.track.travel * d);

export async function owner(page: Page): Promise<JesseOwner> {
  return page.evaluate(() => window.__sz?.owner() ?? "none");
}

/** Jesse figures actually visible right now, by kind. Read from the DOM (what the visitor sees), not from the owner state. */
export async function visibleJesse(page: Page): Promise<{ ribbon: boolean; gallery: boolean; hero: boolean }> {
  return page.evaluate(() => {
    const vis = (sel: string): boolean => {
      const el = document.querySelector<HTMLElement>(sel);
      if (!el) return false;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.05) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
    };
    // the hero's canvas runner is drawn only while the hand-off owner is "hero" and the hero is on screen (the engine stops drawing past its field)
    const heroOnScreen = document.querySelector("[data-hero-rings]")?.getBoundingClientRect().bottom ?? 0;
    return { ribbon: vis(".ribbon-sneak"), gallery: vis(".pg-abseil__actor"), hero: window.__sz?.owner() === "hero" && heroOnScreen > 0 };
  });
}
