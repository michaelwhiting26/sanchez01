import { expect, test, type Page } from "@playwright/test";
import { boot, centred, galleryY, readLayout, scrollToY, settle, type Layout } from "./support";

/**
 * The scroll engine (components/SmoothScroll.tsx, lib/frame.ts, lib/scroll.ts). Page time is Playwright's fake clock (boot), so Lenis, which takes its
 * time from the one frame clock, is deterministic: a wheel turn eases over frames the test steps, never in real time.
 */
let layout: Layout;
const y = (page: Page): Promise<number> => page.evaluate(() => window.scrollY);

test.describe("with smooth scrolling", () => {
  test.beforeEach(async ({ page }) => {
    // wheel input is a mouse/trackpad thing: phones scroll natively by touch (syncTouch: false), and Chromium scales wheel deltas under touch emulation
    test.skip(test.info().project.name === "phone", "wheel smoothing applies to mouse/trackpad (desktop); touch stays native");
    await boot(page);
    layout = await readLayout(page);
  });

  test("a wheel turn eases over several frames and settles exactly where the wheel sent it (Lenis is on, and in step with native scroll)", async ({ page }) => {
    expect(await page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(true);
    // a native jump first (as a scrollbar drag or a key would): Lenis must start the wheel from HERE, not from where it last was
    const start = centred(layout.marquee, layout.vh);
    await scrollToY(page, start, { heroMs: "end" });
    expect(await y(page)).toBe(start);
    await page.mouse.move(layout.vw / 2, layout.vh / 2);
    await page.mouse.wheel(0, 400);
    await page.clock.runFor(50); // three frames
    const mid = await y(page);
    expect(mid, "moving, not jumped").toBeGreaterThan(start + 1);
    expect(mid, "moving, not jumped").toBeLessThan(start + 399);
    await page.clock.runFor(2000);
    expect(Math.abs((await y(page)) - (start + 400)), "settled on the wheel's target").toBeLessThanOrEqual(1);
  });

  test("the gallery lightbox stops the page: no wheel scroll while it is open, and scrolling comes back when it closes", async ({ page }) => {
    await scrollToY(page, galleryY(layout, 0.3), { heroMs: "end" });
    const before = await y(page);
    await page.locator("[data-card]").nth(1).click();
    await settle(page, { ms: 400 });
    await expect(page.locator(".pgl")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.classList.contains("is-scroll-locked"))).toBe(true);
    await page.mouse.wheel(0, 600);
    await page.clock.runFor(1000);
    expect(await y(page), "the page did not move behind the lightbox").toBe(before);
    await page.keyboard.press("Escape");
    await settle(page, { ms: 400 });
    expect(await page.evaluate(() => document.documentElement.classList.contains("is-scroll-locked"))).toBe(false);
    expect(await y(page), "closing restores the position").toBe(before);
    await page.mouse.move(layout.vw / 2, layout.vh / 2);
    await page.mouse.wheel(0, 300);
    await page.clock.runFor(2000);
    expect(await y(page), "the wheel scrolls the page again").toBeGreaterThan(before + 250);
  });

  test("an inner scroller marked data-lenis-prevent scrolls itself and never the page", async ({ page }) => {
    await scrollToY(page, centred(layout.marquee, layout.vh), { heroMs: "end" });
    const before = await y(page);
    await page.evaluate(() => {
      const box = document.createElement("div");
      box.id = "inner-scroller";
      box.setAttribute("data-lenis-prevent", "");
      box.style.cssText = "position:fixed;left:20px;top:20px;width:200px;height:200px;overflow:auto;z-index:99999;background:#222";
      box.innerHTML = '<div style="height:2000px"></div>';
      document.body.append(box);
    });
    await page.mouse.move(120, 120);
    await page.mouse.wheel(0, 500);
    await page.clock.runFor(1000);
    expect(await page.evaluate(() => document.getElementById("inner-scroller")?.scrollTop ?? 0), "the box scrolled").toBeGreaterThan(0);
    expect(await y(page), "the page did not").toBe(before);
  });

  test("programmatic scrolling goes through the engine: eased to a section, and an immediate jump lands at once", async ({ page }) => {
    await page.evaluate(() => window.__sz?.scroll?.to(".sz-marquee"));
    await page.clock.runFor(50);
    expect(await y(page), "eased, not jumped").toBeLessThan(layout.marquee.top - 120);
    await page.clock.runFor(4000);
    // the section's live position: it lands where CSS says scrolled-to content lands, html's scroll-padding (room for the fixed header), like an anchor
    const { top, pad } = await page.evaluate(() => ({
      top: document.querySelector(".sz-marquee")?.getBoundingClientRect().top ?? NaN,
      pad: parseFloat(getComputedStyle(document.documentElement).scrollPaddingBlockStart) || 0,
    }));
    expect(Math.abs(top - pad), `landed ${pad}px below the top (scroll-padding)`).toBeLessThanOrEqual(1);
    await page.evaluate(() => window.__sz?.scroll?.to(1234, { immediate: true, offset: 0 }));
    await page.clock.runFor(16);
    expect(await y(page)).toBe(1234);
  });
});

test("reduced motion: no smooth-scroll engine, the browser scrolls natively", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "load" });
  await page.waitForFunction(() => document.readyState === "complete");
  expect(await page.evaluate(() => document.documentElement.classList.contains("lenis")), "no Lenis for reduced motion").toBe(false);
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
  expect(await y(page)).toBe(900);
});
